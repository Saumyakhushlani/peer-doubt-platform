import axios from "axios";
import { Loader2 } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default function BookmarksByUser() {
    const { id } = useParams();
    const [bookmarks, setBookmarks] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchBookmarks = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        const { data } = await axios.get(`${BASE_URL}/api/bookmark/user/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setBookmarks(data.bookmarks);
        setLoading(false);
        setError(null);
    }
    useEffect(() => {
        fetchBookmarks();
    }, [id]);
    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-black text-[#0f1419]">Bookmarks</h1>
            </div>
            {error && (
                <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {error}
                </div>
            )}
            {loading && (
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
            )}
        </div>
    )
}