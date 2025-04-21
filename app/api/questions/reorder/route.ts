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

export async function PUT(request: Request) {
  try {
    const { questionId, direction } = await request.json();
    const data = await readQuestions();
    
    const currentIndex = data.questions.findIndex((q: any) => q.id === questionId);
    if (currentIndex === -1) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Check if the move is valid
    if (newIndex < 0 || newIndex >= data.questions.length) {
      return NextResponse.json({ error: 'Invalid move' }, { status: 400 });
    }

    // Swap the questions
    [data.questions[currentIndex], data.questions[newIndex]] = 
      [data.questions[newIndex], data.questions[currentIndex]];
    
    // Reassign IDs based on new order
    data.questions.forEach((question: any, index: number) => {
      question.id = index + 1;
    });
    
    await writeQuestions(data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reorder questions' }, { status: 500 });
  }
} 