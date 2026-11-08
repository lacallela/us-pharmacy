import { NextResponse } from 'next/server';
import { getCurrentAdmin, verifyPassword, hashPassword } from '@/lib/auth';
import { findAdminByUsername, updateAdminPassword } from '@/lib/queries';

export async function POST(request: Request) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const admin = await findAdminByUsername(currentAdmin.username);
    if (!admin) {
      return NextResponse.json({ error: 'Admin account not found' }, { status: 404 });
    }

    const isValid = verifyPassword(currentPassword, admin.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    const newHash = hashPassword(newPassword);
    await updateAdminPassword(admin.username, newHash);

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update password' },
      { status: 500 }
    );
  }
}
