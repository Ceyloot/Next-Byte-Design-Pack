import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

const YTIcon   = () => <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.3 2.8 12 2.8 12 2.8s-4.3 0-6.8.1c-.6.1-1.9.1-3 1.3C1.3 5 1 7 1 7S.7 9.1.7 11.3v2c0 2.2.3 4.3.3 4.3s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.3 21.8 12 21.8 12 21.8s4.3 0 6.8-.2c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.1.3-4.3v-2C23.3 9.1 23 7 23 7zm-13.4 8.7V8.3l8.1 3.7-8.1 3.7z"/></svg>;
const IGIcon   = () => <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8 0 3.2 0 3.6-.1 4.8-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1-3.2 0-3.6 0-4.8-.1-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12c0-3.2 0-3.6.1-4.8C2.4 3.9 4 2.3 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zm0-2.2C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1.1 8.3 0 8.7 0 12c0 3.3 0 3.7.1 4.9.2 4.4 2.6 6.8 7 7C8.3 24 8.7 24 12 24c3.3 0 3.7 0 4.9-.1 4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9 0-3.3 0-3.7-.1-4.9-.2-4.4-2.6-6.8-7-7C15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 12 5.8zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z"/></svg>;
const TKIcon   = () => <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34l-.01-8.57a8.17 8.17 0 0 0 4.78 1.52V4.82a4.85 4.85 0 0 1-1-.13z"/></svg>;
const FBIcon   = () => <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"/></svg>;
const LIIcon   = () => <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.37V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.35-1.85 3.59 0 4.25 2.36 4.25 5.43v6.31zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>;

export interface SocialLinks {
  youtube?: string;
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  linkedin?: string;
}

export interface ProfileCardProps {
  name: string;
  role?: string;
  avatar?: ReactNode;
  joinedDate?: string;
  badgeCount?: number;
  socials?: SocialLinks;
  bio?: string;
  showcase?: ReactNode;
  compact?: boolean;
  className?: string;
}

function SocialIcon({ icon, href }: { icon: ReactNode; href?: string }) {
  if (!href) return <span className="text-muted-foreground/20">—</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-muted-foreground hover:text-foreground transition-colors"
      onClick={e => e.stopPropagation()}
    >
      {icon}
    </a>
  );
}

export function ProfileCard({
  name, role, avatar, joinedDate, badgeCount, socials,
  bio, showcase, compact = false, className,
}: ProfileCardProps) {
  return (
    <div className={cn('rounded-2xl border border-border/60 bg-card overflow-hidden', className)}>
      {/* Header */}
      <div className="p-5 flex items-start gap-4">
        {avatar && (
          <div className="shrink-0">{avatar}</div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-foreground">{name}</h3>
            {badgeCount !== undefined && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold border border-border/60 rounded-full px-2 py-0.5 text-muted-foreground">
                ✦ {badgeCount} odznaki
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {role && (
              <span className="text-[11px] font-semibold border border-border/60 rounded-full px-2 py-0.5 text-muted-foreground/80">
                ✦ {role}
              </span>
            )}
            {joinedDate && (
              <span className="text-[11px] text-muted-foreground/60">· {joinedDate}</span>
            )}
          </div>

          {!compact && socials && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <SocialIcon icon={<YTIcon />} href={socials.youtube} />
              <span className="text-muted-foreground/20 text-xs">—</span>
              <SocialIcon icon={<IGIcon />} href={socials.instagram} />
              <span className="text-muted-foreground/20 text-xs">—</span>
              <SocialIcon icon={<TKIcon />} href={socials.tiktok} />
              <span className="text-muted-foreground/20 text-xs">—</span>
              <SocialIcon icon={<FBIcon />} href={socials.facebook} />
              <span className="text-muted-foreground/20 text-xs">—</span>
              <SocialIcon icon={<LIIcon />} href={socials.linkedin} />
            </div>
          )}
        </div>
      </div>

      {!compact && (
        <>
          {/* Bio */}
          {bio !== undefined && (
            <div className="border-t border-border/40 px-5 py-3">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground/60 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground/40">👤</span>
                  O mnie
                  <span className="font-normal opacity-60">KLIKNIJ ABY ROZWINĄĆ</span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 opacity-40" />
              </div>
              {bio && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{bio}</p>}
            </div>
          )}

          {/* Showcase */}
          <div className="border-t border-border/40 px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 flex items-center gap-1.5 mb-3">
              ✦ SHOWCASE
            </p>
            {showcase ?? (
              <p className="text-xs text-muted-foreground/40 italic">Przypnij osiągnięcia w zakładce Przypinki</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
