// app/api/get-user-role/route.ts
import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  console.log('API /get-user-role: Received userId', userId);

  if (!userId) {
    console.error('API /get-user-role: Missing userId');
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    const sql = neon(process.env.NEON_DATABASE_URL!);
    const result = await sql`
      SELECT role FROM users WHERE id = ${userId}
    `;
    console.log('API /get-user-role: Query result', result);

    if (result.length === 0) {
      console.error('API /get-user-role: User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ role: result[0].role });
  } catch (error) {
    console.error('API /get-user-role: Error fetching role', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}