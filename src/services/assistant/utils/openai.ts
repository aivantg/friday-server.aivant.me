import OpenAI from 'openai';
import type {
  ChatCompletion,
  ChatCompletionCreateParams,
} from 'openai/resources';
import type { OpenAIModel } from './types';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient, TranscriptionRecord } from '@prisma/client';

export const openai = new OpenAI();

export const chatCompletion = async (
  message: string,
  model: OpenAIModel,
  systemPrompt: string,
  functions: ChatCompletionCreateParams.Function[] | undefined,
  functionToCall: string | undefined,
  shouldReturnJSON: boolean
): Promise<ChatCompletion> => {
  return await openai.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ],
    model,
    response_format: shouldReturnJSON ? { type: 'json_object' } : undefined,
    functions,
    function_call: functionToCall ? { name: functionToCall } : undefined,
  });
};

// Calculate file hash
const calculateFileHash = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
};

const prisma = new PrismaClient();

export const transcribe = async (
  filePath: string
): Promise<TranscriptionRecord> => {
  // Calculate hash of the file
  const fileHash = await calculateFileHash(filePath);

  console.log('Transcribing file with path:', filePath);
  console.log('File hash:', fileHash);

  // Check if the file has been transcribed before
  const existingTranscription = await prisma.transcriptionRecord.findUnique({
    where: { fileHash: fileHash },
  });

  if (existingTranscription) {
    console.log('Transcription already exists for this file.');
    const updatedRecord = await prisma.transcriptionRecord.update({
      where: { fileHash: fileHash },
      data: { lastRequestedAt: new Date() },
    });
    console.log(existingTranscription);
    return updatedRecord;
  }

  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: 'whisper-1',
  });

  console.log('Transcription complete');
  console.log(transcription.text);

  // Save transcription to the database
  const newTranscription = await prisma.transcriptionRecord.create({
    data: {
      fileHash: fileHash,
      name: path.basename(filePath),
      transcription: transcription.text,
    },
  });

  console.log('Transcription saved to database.');
  console.log(newTranscription);

  return newTranscription;
};
