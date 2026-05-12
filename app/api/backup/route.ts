import { NextResponse } from "next/server";
import { getReleases, getPersonalInfo, getDesignSettings, saveReleases, savePersonalInfo, saveDesignSettings } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [releases, personal, design] = await Promise.all([
    getReleases(),
    getPersonalInfo(),
    getDesignSettings(),
  ]);

  const backup = {
    _meta: {
      version: 2,
      exportedAt: new Date().toISOString(),
    },
    releases,
    personal,
    design,
  };

  return NextResponse.json(backup);
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const backup = await request.json();

    if (!backup.releases || !backup.personal || !backup.design) {
      return NextResponse.json(
        { error: "Fichier de backup invalide : il manque releases, personal ou design." },
        { status: 400 }
      );
    }

    await Promise.all([
      saveReleases(backup.releases),
      savePersonalInfo(backup.personal),
      saveDesignSettings(backup.design),
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la restauration du backup." },
      { status: 500 }
    );
  }
}
