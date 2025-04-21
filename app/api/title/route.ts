import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const questionsPath = path.join(process.cwd(), 'questions.json');

async function readQuestions() {
  const fileContent = await fs.promises.readFile(questionsPath, 'utf-8');
  return JSON.parse(fileContent);
}

async function writeQuestions(data: any) {
  await fs.promises.writeFile(questionsPath, JSON.stringify(data, null, 2));
}

export async function GET() {
  try {
    const data = await readQuestions();
    return NextResponse.json({ title: data.title });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read title' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { title } = await request.json();
    const data = await readQuestions();
    data.title = title;
    await writeQuestions(data);
    return NextResponse.json({ title });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update title' }, { status: 500 });
  }
} 