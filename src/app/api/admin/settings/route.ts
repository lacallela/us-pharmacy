import { NextResponse } from 'next/server';
import { getSiteSettings, getAllSiteSettingsList, updateSiteSettings } from '@/lib/queries';
import { getCurrentAdmin } from '@/lib/auth';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const settingsList = await getAllSiteSettingsList();
  const settingsMap = await getSiteSettings();

  return NextResponse.json({
    settings: settingsMap,
    list: settingsList
  });
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid settings payload' }, { status: 400 });
    }

    await updateSiteSettings(body);
    const updated = await getSiteSettings();

    return NextResponse.json({
      success: true,
      settings: updated
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update settings' }, { status: 500 });
  }
}
