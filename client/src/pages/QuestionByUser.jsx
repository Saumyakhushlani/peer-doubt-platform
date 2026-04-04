import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default function QuestionByUser() {
    const { id } = useParams();
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    
    const fetchQuestions = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        const { data } = await axios.get(`${BASE_URL}/api/question/user/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setQuestions(data.questions);
    }

    useEffect(() => {
        fetchQuestions();
    }, [id]);

    return (
    <div className="min-h-screen bg-[#f0f7fc] px-6 pb-20 pt-10 font-sans text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-black text-[#0f1419]">Questions</h1>
        </div>
      </div>
    </div>
  );
}