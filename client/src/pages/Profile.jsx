import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import {
  Award,
  BookOpen,
  Calendar,
  ChevronRight,
  GraduationCap,
  Library,
  Loader2,
  MapPin,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function GlassNav() {
  return (
    <header
      className="sticky top-0 z-20 border-b border-transparent"
      style={{
        backgroundColor: 'rgba(248, 249, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-on-background"
          style={{ letterSpacing: '-0.02em' }}
        >
          Peer Doubt
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-on-surface/80 sm:flex">
          <span className="cursor-default">Explore</span>
          <span className="cursor-default">Questions</span>
          <span className="cursor-default">Leaderboard</span>
        </nav>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-container-highest text-on-surface"
          aria-hidden
        >
          <UserRound className="h-5 w-5" strokeWidth={1.75} />
        </div>
      </div>
    </header>
  )
}

function formatJoined(iso) {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('en-IN', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return '—'
  }
}

export default function Profile() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setIsLoading(false)
      setError('Missing profile id')
      return
    }

    const token = localStorage.getItem('token')

    async function load() {
      setIsLoading(true)
      setError(null)
      if (!token) {
        setError('Please sign in to view your profile')
        setIsLoading(false)
        return
      }
      try {
        const { data } = await axios.get(`${baseUrl}/api/user/${id}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        setUser(data.user)
      } catch (err) {
        setError(
          err.response?.data?.error ??
            err.message ??
            'Could not load profile'
        )
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [id])

  const counts = user?._count ?? {
    questions: 0,
    answers: 0,
    votes: 0,
  }
  const tagChips = user?.department
    ? [user.department, 'Peer scholar'].filter(Boolean)
    : ['Peer scholar']

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface">
        <GlassNav />
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-on-surface/70">
          <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={1.75} />
          <p className="text-sm font-medium">Loading profile…</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-surface">
        <GlassNav />
        <div className="mx-auto max-w-lg px-6 py-20 text-center">
          <p
            className="rounded-lg px-4 py-3 text-sm"
            style={{ backgroundColor: '#ffdad6', color: '#ba1a1a' }}
          >
            {error || 'User not found'}
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block text-sm font-semibold text-secondary underline decoration-2 underline-offset-4"
          >
            Sign in
          </Link>
          <span className="mx-2 text-on-surface/40">·</span>
          <Link
            to="/"
            className="mt-6 inline-block text-sm font-semibold text-on-surface/80 underline decoration-2 underline-offset-4"
          >
            Home
          </Link>
        </div>
      </div>
    )
  }

  const avatarSrc =
    user.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=256&background=d3e4fe&color=0b1c30&bold=true`

  return (
    <div className="min-h-screen bg-surface pb-20">
      <GlassNav />

      <main className="mx-auto max-w-6xl px-6 pt-12">
        <div className="mb-12 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-10 lg:col-span-7">
            <div>
              <p className="mb-2 flex items-center gap-2 font-[family-name:var(--font-body)] text-sm font-medium text-secondary">
                <Sparkles className="h-4 w-4" strokeWidth={1.75} />
                Scholar profile
              </p>
              <h1
                className="font-[family-name:var(--font-display)] text-4xl font-bold leading-tight text-on-background sm:text-5xl"
                style={{ letterSpacing: '-0.02em' }}
              >
                The Digital Curator
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-on-surface/85">
                Your contributions shape the knowledge base. This space reflects
                your academic identity—structured, credible, and built for peers.
              </p>
            </div>

            <section className="rounded-lg bg-surface-container-low p-8 sm:p-10">
              <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
                <div className="relative shrink-0">
                  <div
                    className="overflow-hidden rounded-lg bg-surface-container-highest p-1"
                    style={{
                      boxShadow:
                        '0 32px 64px -16px rgba(11, 28, 48, 0.06), 0 8px 24px rgba(11, 28, 48, 0.04)',
                    }}
                  >
                    <img
                      src={avatarSrc}
                      alt=""
                      width={140}
                      height={140}
                      className="h-36 w-36 rounded-md object-cover"
                    />
                  </div>
                  <div
                    className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-md text-secondary-fixed"
                    style={{
                      background:
                        'linear-gradient(135deg, #002045 0%, #1a365d 100%)',
                    }}
                    aria-hidden
                  >
                    <ShieldCheck className="h-5 w-5 text-white" strokeWidth={1.75} />
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-6">
                  <div>
                    <h2
                      className="font-[family-name:var(--font-display)] text-2xl font-semibold text-on-background sm:text-3xl"
                      style={{ letterSpacing: '-0.02em' }}
                    >
                      {user.name}
                    </h2>
                    <p className="mt-1 font-mono text-sm text-on-surface/70">
                      Scholar No. {user.scholar_no}
                    </p>
                    <p className="mt-2 text-xs text-on-surface/50">
                      Profile id · {user.id}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {tagChips.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex max-w-full truncate rounded-md px-3 py-1 text-xs font-medium text-on-secondary-container"
                        style={{ backgroundColor: '#ffddb2' }}
                        title={tag}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-container-highest text-primary">
                        <GraduationCap className="h-5 w-5" strokeWidth={1.75} />
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-on-surface/55">
                          Department
                        </dt>
                        <dd className="mt-0.5 text-sm font-medium leading-relaxed text-on-surface">
                          {user.department}
                        </dd>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-container-highest text-primary">
                        <Calendar className="h-5 w-5" strokeWidth={1.75} />
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-on-surface/55">
                          Year & cohort
                        </dt>
                        <dd className="mt-0.5 text-sm font-medium text-on-surface">
                          Year {user.year} · Joined {formatJoined(user.createdAt)}
                        </dd>
                      </div>
                    </div>
                    <div className="flex gap-3 sm:col-span-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-container-highest text-primary">
                        <MapPin className="h-5 w-5" strokeWidth={1.75} />
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-on-surface/55">
                          Campus
                        </dt>
                        <dd className="mt-0.5 text-sm font-medium text-on-surface">
                          MANIT Bhopal · {user.gender}
                        </dd>
                      </div>
                    </div>
                  </dl>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-2"
                      style={{
                        background:
                          'linear-gradient(135deg, #002045 0%, #1a365d 100%)',
                      }}
                    >
                      Edit profile
                      <ChevronRight className="ml-1 h-4 w-4" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      className="rounded-md bg-surface-container-highest px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-surface-container-high"
                    >
                      View activity
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <aside
              className="rounded-lg px-6 py-5 italic"
              style={{
                backgroundColor: '#063665',
                color: '#7ca0d5',
              }}
            >
              <p className="font-[family-name:var(--font-body)] text-sm leading-relaxed">
                “Knowledge shared in good faith compounds across cohorts. Treat
                every answer as a footnote in the department’s collective
                bibliography.”
              </p>
              <p className="mt-3 text-xs not-italic opacity-90">
                — Peer Doubt editorial charter
              </p>
            </aside>

            <div className="rounded-xl bg-surface-container-highest p-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium text-on-surface/70">
                <BookOpen className="h-4 w-4" strokeWidth={1.75} />
                Scholar snapshot
              </div>
              <pre className="overflow-x-auto font-mono text-sm leading-relaxed text-on-surface">
                <code>{`{
  "scholar": "${user.scholar_no}",
  "department": "${user.department.replace(/"/g, '\\"')}",
  "year": ${user.year}
}`}</code>
              </pre>
              <div
                className="mt-4 h-1 w-12 rounded-full"
                style={{ backgroundColor: '#815500' }}
                aria-hidden
              />
            </div>
          </div>

          <aside className="space-y-8 lg:col-span-5">
            <div
              className="rounded-lg p-8"
              style={{ backgroundColor: '#d3e4fe' }}
            >
              <h3
                className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-on-background"
                style={{ letterSpacing: '-0.02em' }}
              >
                Standing
              </h3>
              <p className="mt-1 text-sm text-on-surface/75">
                Activity from your questions, answers, and votes on the platform.
              </p>

              <ul className="mt-8 space-y-8">
                <li className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-surface-container-lowest text-primary shadow-sm">
                    <MessageSquareText className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold tabular-nums text-on-background">
                      {counts.questions}
                    </p>
                    <p className="text-sm text-on-surface/70">Questions asked</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-surface-container-lowest text-primary shadow-sm">
                    <Library className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold tabular-nums text-on-background">
                      {counts.answers}
                    </p>
                    <p className="text-sm text-on-surface/70">Answers posted</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-surface-container-lowest text-primary shadow-sm">
                    <Award className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold tabular-nums text-on-background">
                      {counts.votes}
                    </p>
                    <p className="text-sm text-on-surface/70">Votes cast</p>
                  </div>
                </li>
              </ul>

              <Link
                to="/"
                className="mt-10 inline-flex items-center text-sm font-semibold text-secondary underline decoration-2 underline-offset-4"
              >
                Back to home
              </Link>
            </div>

            <div className="rounded-lg bg-surface-container-low p-6">
              <h4 className="text-sm font-semibold text-on-background">
                Editorial note
              </h4>
              <p className="mt-3 text-sm leading-relaxed text-on-surface/80">
                Spacing and tone replace hard lines. If something feels crowded,
                add breath—not borders.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
