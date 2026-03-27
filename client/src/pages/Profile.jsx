import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

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

    const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

    async function fetchUser() {
      setIsLoading(true)
      setError(null)
      try {
        const { data } = await axios.get(`${baseUrl}/api/user/${id}`)
        setUser(data.user)
      } catch (err) {
        setError(
          err.response?.data?.error ??
            err.message ??
            'Failed to fetch user'
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [id])

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>{error}</div>
  if (!user) return <div>User not found</div>

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.department}</p>
      <p>{user.year}</p>
      {user.image ? (
        <img src={user.image} alt={user.name} width={128} height={128} />
      ) : null}
      <p>{user.gender}</p>
      <p>{user.scholar_no}</p>
      <p>{user.createdAt}</p>
    </div>
  )
}
