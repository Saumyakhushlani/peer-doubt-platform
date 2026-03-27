import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem',
      }}
    >
      <h1 style={{ fontSize: '2rem', margin: 0 }}>Page not found</h1>
      <p style={{ margin: 0, opacity: 0.85 }}>
        Nothing matches this URL.
      </p>
      <Link to="/">Back to home</Link>
    </section>
  )
}

export default NotFound
