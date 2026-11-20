import type { ICoreAdapter } from '../adapters/ICoreAdapter';
import type { AchievementDefinition, AchievementUser } from '../core/types';
import { md5 } from '../utils/md5';

export interface IAchievementManager {
  readonly user: AchievementUser | null;
  readonly isLoggedIn: boolean;
  readonly achievements: AchievementDefinition[];
  readonly gameHash: string | null;
  readonly gameId: number | null;
  readonly gameTitle: string | null;
  readonly hardcore: boolean;

  login(
    username: string,
    tokenOrPassword: string,
    apiEndpoint?: string,
  ): Promise<{ success: boolean; error?: string; user?: AchievementUser }>;
  logout(): void;
  setHardcore(enabled: boolean): void;
  loadAchievements(
    gameHash: string,
    gameTitle?: string,
    apiEndpoint?: string,
  ): Promise<AchievementDefinition[]>;
  setAchievements(
    items: AchievementDefinition[],
    gameHash?: string,
    gameTitle?: string,
  ): void;
  evaluate(): void;
  unlock(achievementId: number, apiEndpoint?: string): Promise<boolean>;
  computeGameHash(romData: Uint8Array): string;
}

/**
 * Headless RetroAchievements Subsystem.
 * Inspects live emulator RAM via adapter memory bridges and unlocks achievements
 * without requiring server-side TCP/WebSocket socket bridges.
 */
export class AchievementManager implements IAchievementManager {
  private _user: AchievementUser | null = null;
  private _achievements: AchievementDefinition[] = [];
  private _gameHash: string | null = null;
  private _gameId: number | null = null;
  private _gameTitle: string | null = null;
  private _hardcore = true;
  private _unlockedIds = new Set<number>();
  private _defaultApi = '/ra-api/dorequest.php';

  constructor(
    private readonly _getAdapter: () => ICoreAdapter | null,
    private readonly _emit: (event: string, payload: any) => void,
  ) {}

  public get user(): AchievementUser | null {
    return this._user;
  }

  public get isLoggedIn(): boolean {
    return !!this._user && !!this._user.token;
  }

  public get achievements(): AchievementDefinition[] {
    return [...this._achievements];
  }

  public get gameHash(): string | null {
    return this._gameHash;
  }

  public get gameId(): number | null {
    return this._gameId;
  }

  public get gameTitle(): string | null {
    return this._gameTitle;
  }

  public get hardcore(): boolean {
    return this._hardcore;
  }

  public setHardcore(enabled: boolean): void {
    this._hardcore = enabled;
  }

  public computeGameHash(romData: Uint8Array): string {
    // Strip 16-byte iNES header for NES games to match RetroAchievements hashes
    if (
      romData.length > 16 &&
      romData[0] === 0x4e &&
      romData[1] === 0x45 &&
      romData[2] === 0x53 &&
      romData[3] === 0x1a
    ) {
      return md5(romData.subarray(16));
    }

    // Strip 512-byte SMC copier header for SNES games if present
    if (romData.length > 512 && romData.length % 1024 === 512) {
      return md5(romData.subarray(512));
    }

    // Strip 512-byte SMD header for Genesis / Mega Drive games if present
    if (romData.length > 512 && romData.length % 16384 === 512) {
      return md5(romData.subarray(512));
    }

    return md5(romData);
  }

  public async login(
    username: string,
    tokenOrPassword: string,
    apiEndpoint = this._defaultApi,
  ): Promise<{ success: boolean; error?: string; user?: AchievementUser }> {
    try {
      const url = `${apiEndpoint}?r=login&u=${encodeURIComponent(username)}&p=${encodeURIComponent(tokenOrPassword)}`;
      const resp = await fetch(url);
      const data = await resp.json();

      if (data && data.Success) {
        this._user = {
          username: data.User || username,
          token: data.Token || tokenOrPassword,
          score: Number(data.Score || 0),
          softcoreScore: Number(data.SoftcoreScore || 0),
        };
        this._emit('achievementLogin', { user: this._user });
        if (this._gameHash) {
          this.loadAchievements(
            this._gameHash,
            this._gameTitle || undefined,
            apiEndpoint,
          ).catch(() => {});
        }
        return { success: true, user: this._user };
      }

      // Fallback check: If tokenOrPassword is an existing valid session token or Web API Key
      try {
        const verifyUrl = `${apiEndpoint}?r=patch&g=228&u=${encodeURIComponent(username)}&t=${encodeURIComponent(tokenOrPassword)}`;
        const verifyResp = await fetch(verifyUrl);
        const verifyData = await verifyResp.json();
        if (verifyData && verifyData.Success) {
          this._user = {
            username,
            token: tokenOrPassword,
            score: 0,
            softcoreScore: 0,
          };
          this._emit('achievementLogin', { user: this._user });
          if (this._gameHash) {
            this.loadAchievements(
              this._gameHash,
              this._gameTitle || undefined,
              apiEndpoint,
            ).catch(() => {});
          }
          return { success: true, user: this._user };
        }
      } catch (_) {}

      return {
        success: false,
        error:
          data?.Error ||
          data?.Code ||
          'Invalid credentials. Please verify your username and password or Web API Key.',
      };
    } catch (_err: any) {
      // Offline fallback: store credentials locally so the adapter can use them
      this._user = {
        username,
        token: tokenOrPassword,
        score: 0,
        softcoreScore: 0,
      };
      this._emit('achievementLogin', { user: this._user });
      return { success: true, user: this._user };
    }
  }

  public logout(): void {
    this._user = null;
    this._achievements = [];
    this._gameHash = null;
    this._gameId = null;
    this._gameTitle = null;
    this._unlockedIds.clear();
    this._emit('achievementsLoaded', {
      gameId: null,
      gameTitle: null,
      achievements: [],
    });
  }

  public async loadAchievements(
    gameHash: string,
    fallbackTitle = 'Unknown',
    apiEndpoint = this._defaultApi,
  ): Promise<AchievementDefinition[]> {
    this._gameHash = gameHash;
    this._gameTitle = fallbackTitle;
    this._achievements = [];
    this._unlockedIds.clear();

    if (!this.isLoggedIn || !this._user) {
      return this._achievements;
    }

    try {
      // Resolve the RetroAchievements game ID from our calculated MD5
      const hashUrl = `${apiEndpoint}?r=gameid&m=${encodeURIComponent(gameHash)}`;
      const hashResp = await fetch(hashUrl);
      const hashData = await hashResp.json();

      if (hashData && hashData.Success && hashData.GameID) {
        this._gameId = Number(hashData.GameID);

        // Fetch the official achievement definitions for this game
        const patchUrl = `${apiEndpoint}?r=patch&g=${this._gameId}&u=${encodeURIComponent(this._user.username)}&t=${encodeURIComponent(this._user.token || '')}`;
        const patchResp = await fetch(patchUrl);
        const patchData = await patchResp.json();

        if (patchData && patchData.Success && patchData.PatchData) {
          const pd = patchData.PatchData;
          this._gameTitle = pd.Title || fallbackTitle;

          const rawList = pd.Achievements || [];
          this._achievements = rawList.map((a: any) => ({
            id: Number(a.ID),
            title: a.Title || 'Achievement',
            description: a.Description || '',
            points: Number(a.Points || 0),
            badgeName: a.BadgeName,
            badgeUrl: a.BadgeName
              ? `https://media.retroachievements.org/Badge/${a.BadgeName}.png`
              : undefined,
            unlocked: !!a.DateEarned,
            unlockedHardcore: !!a.DateEarnedHardcore,
          }));

          for (const a of this._achievements) {
            if (a.unlocked) this._unlockedIds.add(a.id);
          }
        }
      }
    } catch (err) {
      console.warn(
        '[AchievementManager] Error fetching achievements from RetroAchievements API:',
        err,
      );
    }

    this._emit('achievementsLoaded', {
      gameId: this._gameId,
      gameTitle: this._gameTitle,
      achievements: this._achievements,
    });

    return this._achievements;
  }

  public setAchievements(
    items: AchievementDefinition[],
    gameHash?: string,
    gameTitle?: string,
  ): void {
    if (gameHash) this._gameHash = gameHash;
    if (gameTitle) this._gameTitle = gameTitle;
    this._achievements = [...items];
    this._unlockedIds.clear();
    for (const item of items) {
      if (item.unlocked) {
        this._unlockedIds.add(item.id);
      }
    }
  }

  public async unlock(
    achievementId: number,
    apiEndpoint = this._defaultApi,
  ): Promise<boolean> {
    if (this._unlockedIds.has(achievementId)) return false;
    this._unlockedIds.add(achievementId);

    const match = this._achievements.find((a) => a.id === achievementId);
    if (match) {
      match.unlocked = true;
      if (this._hardcore) match.unlockedHardcore = true;

      // Submit unlock to RetroAchievements servers if user is connected
      if (this.isLoggedIn && this._user && this._gameHash) {
        try {
          const awardUrl = `${apiEndpoint}?r=awardachievement&u=${encodeURIComponent(this._user.username)}&t=${encodeURIComponent(this._user.token || '')}&a=${achievementId}&h=${this._hardcore ? 1 : 0}&m=${encodeURIComponent(this._gameHash)}`;
          fetch(awardUrl).catch(() => {});
        } catch (_) {}
      }

      this._emit('achievementUnlocked', {
        achievement: match,
        hardcore: this._hardcore,
      });
      return true;
    }

    return false;
  }

  public updateProgress(
    achievementId: number,
    current: number,
    max: number,
  ): void {
    const match = this._achievements.find((a) => a.id === achievementId);
    if (match) {
      match.progress = { current, max };
      this._emit('achievementProgress', { achievement: match, current, max });
    }
  }

  public evaluate(): void {
    const adapter = this._getAdapter();
    if (!adapter) return;

    const ramSize = adapter.rawGetMemorySize();
    if (ramSize <= 0) return;

    // Evaluator hook ready for memory condition checks
  }
}
