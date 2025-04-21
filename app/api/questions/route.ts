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
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read questions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await readQuestions();
    const newQuestion = await request.json();
    
    // Generate new ID
    const newId = Math.max(...data.questions.map((q: any) => q.id), 0) + 1;
    newQuestion.id = newId;
    
    data.questions.push(newQuestion);
    await writeQuestions(data);
    
    return NextResponse.json(newQuestion);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add question' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await readQuestions();
    const updatedQuestion = await request.json();
    
    const index = data.questions.findIndex((q: any) => q.id === updatedQuestion.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    
    data.questions[index] = updatedQuestion;
    await writeQuestions(data);
    
    return NextResponse.json(updatedQuestion);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');
    
    const data = await readQuestions();
    const index = data.questions.findIndex((q: any) => q.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    
    data.questions.splice(index, 1);
    await writeQuestions(data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }
} 