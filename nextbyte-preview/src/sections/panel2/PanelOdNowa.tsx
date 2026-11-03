import { useState } from 'react'
import {
  Activity, ArrowUpRight, Bell, Brain, CalendarDays, Camera, Check, CheckSquare,
  CircleHelp, Cloud, FileText, Grid2X2, MessageSquare, ChevronRight,
  Moon, MoreHorizontal, Paperclip, PanelLeftClose, PenTool, Plus, Search, Send,
  Settings, Sparkles, Sun, User, Video, WandSparkles, Zap,
} from 'lucide-react'
import './fundament/powierzchnie.css'
import './dashboard-preview.css'

const NAV = [
  { title: '', items: [['panel', 'Panel Główny', Grid2X2]] },
  { title: 'AI', items: [['assistant', 'Personalny Asystent', Sparkles], ['chat', 'Chat AI', MessageSquare], ['promptex', 'PromptEx', WandSparkles], ['memory', 'Pamięć AI', Brain]] },
  { title: 'PRZYPIĘTE MODUŁY', items: [['trend', 'Trend', Activity], ['photos', 'Studio Zdjęć', Camera], ['video', 'Studio Video', Video]] },
  { title: 'PRACA', items: [['calendar', 'Kalendarz', CalendarDays], ['tasks', 'Zadania', CheckSquare], ['notes', 'Notatki', FileText], ['boards', 'Tablice', PenTool], ['cloud', 'NextCloud', Cloud]] },
  { title: 'PANEL', items: [['settings', 'Ustawienia', Settings], ['help', 'Pomoc', CircleHelp]] },
] as const

const AKTYWNOSCI = [
  { icon: MessageSquare, color: 'blue', title: 'Czat AI', desc: 'Pisz i pracuj z modelami' },
  { icon: Sparkles, color: 'violet', title: 'Personalny asystent', desc: 'Pomoc dopasowana do Ciebie' },
  { icon: Camera, color: 'rose', title: 'Studio zdjęć', desc: 'Twórz i edytuj obrazy' },
  { icon: Video, color: 'amber', title: 'Studio wideo', desc: 'Twórz klipy i rolki' },
]
const RECENT = [
  { icon: MessageSquare, color: 'blue', title: 'Opisy do katalogu jesiennego', meta: 'Chat AI · dziś 16:00' },
  { icon: Camera, color: 'violet', title: 'Packshot — seria biała', meta: 'Studio Zdjęć · dziś 11:00' },
  { icon: Video, color: 'rose', title: 'Rolka: montaż w 15 minut', meta: 'Studio Video · wczoraj' },
  { icon: FileText, color: 'amber', title: 'Ustalenia ze spotkania', meta: 'Notatki · 1 lis' },
]

function MiniBars({ muted = false }: { muted?: boolean }) {
  return <div className={`sp-bars ${muted ? 'muted' : ''}`} aria-hidden="true">{Array.from({ length: 32 }, (_, i) => <i key={i} style={{ height: `${26 + ((i * 17 + 21) % 66)}%` }} />)}</div>
}

export function PanelOdNowa({ onWyjscie }: { onWyjscie?: () => void }) {
  const [jasny, setJasny] = useState(true)
  const [aktywny, setAktywny] = useState('panel')
  const [prompt, setPrompt] = useState('')
  const [wybranaGodzina, setWybranaGodzina] = useState('12:00')
  const [ukonczone, setUkonczone] = useState(false)
  const [filtr, setFiltr] = useState('Wszystko')
  const [dataOpen, setDataOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [tryb, setTryb] = useState('Czat AI')

  return (
    <div className={`sp-shell ${jasny ? 'sp-light' : ''}`}>
      <aside className="sp-sidebar">
        <header className="sp-brand"><span className="sp-logo">N</span><b>NEXTBYTE</b><button onClick={() => setJasny(!jasny)} aria-label="Zmień motyw">{jasny ? <Moon/> : <Sun/>}</button><button aria-label="Zwiń menu"><PanelLeftClose/></button></header>
        <div className="sp-side-search"><Search/><input placeholder="Wyszukaj..."/><kbd>⌘ K</kbd><button aria-label="Pomoc"><CircleHelp/></button></div>
        <nav className="sp-nav">{NAV.map(group => <section key={group.title || 'home'}>{group.title && <h3>{group.title}</h3>}{group.items.map(([id, label, Icon]) => <button key={id} title={label} onClick={() => setAktywny(id)} className={aktywny === id ? 'active' : ''}><Icon/><span>{label}</span></button>)}</section>)}</nav>
        <footer className="sp-dock">{[[Activity,'Aktywność'],[Bell,'Powiadomienia'],[Zap,'Byte'],[User,'Konto']].map(([Icon,label]: any)=><button key={label} title={label}><Icon/></button>)}</footer>
      </aside>

      <main className="sp-main"><header className="sp-topbar"><label><Search/><input placeholder="Szukaj w całej platformie..."/><kbd>⌘ K</kbd></label><div className="sp-top-actions"><button aria-label="Powiadomienia" className="sp-notify"><Bell/><i/></button><div className="sp-date-control"><button className="sp-current-date" onClick={()=>setDataOpen(!dataOpen)}><CalendarDays/>3 listopada 2026<ChevronRight/></button>{dataOpen&&<div className="sp-date-popover"><b>Listopad 2026</b><div>{['Pn','Wt','Śr','Cz','Pt','So','Nd'].map(x=><small key={x}>{x}</small>)}{Array.from({length:35},(_,i)=><button className={i===8?'selected':''} key={i}>{i<6?26+i:i-5}</button>)}</div></div>}</div><button className="sp-create"><Plus/> Utwórz</button></div></header><div className="sp-dashboard">
        <section className="sp-top-grid">
          <article className="sp-widget sp-stat-card"><div className="sp-stat-head"><div><span>Twoje Byte</span><strong>57 <i>♢</i></strong><small>Starczy do <b>14 listopada</b> przy 5 ⟠ dziennie</small></div><button aria-label="Portfel"><Zap/></button></div><div className="sp-progress-track"><i style={{width:'72%'}}/></div><div className="sp-stat-foot"><span>Wydane</span><b>0 ⟠</b><span>Saldo · 500 ⟠</span></div></article>
          <article className="sp-widget sp-stat-card"><div className="sp-stat-head"><div><span>Aktywność</span><strong>69 <small>dni</small></strong><small>Pracujesz w dobrym rytmie. Tak trzymaj.</small></div><button aria-label="Aktywność"><Activity/></button></div><div className="sp-progress-track"><i style={{width:'66%'}}/></div><div className="sp-stat-foot"><span>Aktywne</span><b>69</b><span>W pół roku</span></div></article>
          <article className="sp-widget sp-stat-card"><div className="sp-stat-head"><div><span>Czeka na Ciebie</span><strong>1 <small>sprawa</small></strong><small>Nic nie jest spóźnione. Spokojnie.</small></div><button aria-label="Zadania"><CheckSquare/></button></div><div className="sp-progress-track quiet"><i style={{width:'4%'}}/></div><div className="sp-stat-foot"><span>Po terminie</span><b>0</b><span>Na później</span><b>1</b></div></article>
          <article className="sp-widget sp-stat-card"><div className="sp-stat-head"><div><span>Pamięć AI</span><strong>8 <small>wspomnień</small></strong><small>Ostatnie: „Zawód”. Sięgnęło 1× w tym tygodniu.</small></div><button aria-label="Pamięć AI"><Brain/></button></div><div className="sp-progress-track"><i style={{width:'54%'}}/></div><div className="sp-stat-foot"><span>Praca</span><b>5</b><span>Zainteresowania</span><b>3</b></div></article>
        </section>

        <div className="sp-work-grid">
          <div className="sp-work-left">
            <section className="sp-widget sp-chat">
              <header className="sp-chat-welcome"><span><Sparkles/></span><div><b>Cześć, Artur. Od czego zaczynamy?</b><small>Napisz zdanie albo wybierz jedną z czynności.</small></div><div className="sp-chat-tools"><div className="sp-picker"><button title="Wybierz tryb pracy" onClick={()=>setPickerOpen(!pickerOpen)}><Sparkles/>{tryb}<ChevronRight/></button>{pickerOpen&&<div>{['Czat AI','Personalny asystent','Studio zdjęć','Studio wideo'].map(x=><button key={x} onClick={()=>{setTryb(x);setPickerOpen(false)}}>{x}</button>)}</div>}</div><button title="Dołącz plik"><Paperclip/></button><button title="Dodaj obraz"><Camera/></button><button title="Więcej"><MoreHorizontal/></button></div></header>
              <form className="sp-prompt" onSubmit={(e) => { e.preventDefault(); setPrompt('') }}><input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Np. opisz produkt do katalogu jesiennego..."/><button aria-label="Wyślij prompt"><Send/></button></form>
              <div className="sp-action-cards">{AKTYWNOSCI.map(({icon: Icon,color,title,desc})=><button className={color} key={title}><span><Icon/></span><b>{title}</b><small>{desc}</small></button>)}</div>
            </section>
            <div className="sp-lower-grid">
              <article className="sp-widget sp-spending"><header><div className="sp-spending-title"><b>Na co idą Byte</b><button aria-label="Otwórz wydatki"><ArrowUpRight/></button></div><strong>443 <i>♢</i><small>w tym miesiącu</small></strong><div className="sp-spend-tags"><span className="violet">Studio Zdjęć · 186 ⟠</span><span className="blue">Chat AI · 152 ⟠</span><span className="rose">Studio Video · 105 ⟠</span></div></header><div className="sp-spend-chart"><MiniBars/><span>5 ⟠ / dzień</span></div></article>
              <article className="sp-widget sp-recent"><header><b>Wróć do roboty</b><div>{['Wszystko','Chat AI','Studio Zdjęć','Studio Video','Notatki'].map(x=><button key={x} className={filtr===x?'selected':''} onClick={()=>setFiltr(x)}>{x}</button>)}</div></header><div className="sp-recent-items">{RECENT.map(({icon: Icon,color,title,meta})=><button key={title}><span className={`sp-folder-art tint-${color}`}><i/><Icon/></span><b>{title}</b><small>{meta}</small></button>)}</div></article>
            </div>
          </div>
          <aside className="sp-today sp-widget"><header><div><b>Dziś</b><small>Twój plan na dziś</small></div><button aria-label="Otwórz plan"><ArrowUpRight/></button></header><div className="sp-date-select"><div><b>Listopad</b><span>3 wolne okna</span></div><div className="sp-date-pills">{['12','13','14','15','16','17','18'].map((d,i)=><button className={i===2?'selected':''} key={d}>{d}</button>)}</div><div className="sp-time-grid">{['10:00','11:00','12:00','13:00','14:00','16:00'].map(t=><button className={wybranaGodzina===t?'selected':''} onClick={()=>setWybranaGodzina(t)} key={t}>{t}</button>)}</div></div><div className="sp-tasks"><span>CZEKA NA CIEBIE</span><button className={ukonczone?'completed':''} onClick={()=>setUkonczone(!ukonczone)}><i>{ukonczone&&<Check/>}</i><b>{ukonczone?'Zadanie ukończone':'zadanie'}</b><small>bez terminu</small><em>{ukonczone?'gotowe':'pilne'}</em></button></div><div className="sp-cloud-meter"><div><Cloud/><span>PrivateCloud</span><small>0.4 GB z 1 GB</small></div><div className="sp-storage"><i/></div></div></aside>
        </div>
        {onWyjscie && <button className="sp-back" onClick={onWyjscie}>Wróć do podglądu</button>}
      </div></main>
    </div>
  )
}
