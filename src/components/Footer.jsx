import { FaChessQueen } from "react-icons/fa";

export default function Footer({ user }) {
  const getUserColor = () => {
    if (!user) return "bg-purple-700";
    return user.type === "teacher" ? "bg-emerald-700" : "bg-blue-700";
  };

  return (
    <footer className={`${getUserColor()} text-white text-center py-4 shadow-lg`}>
      <div className="flex justify-center items-center space-x-2">
        <FaChessQueen className="text-xl" />
        <span className="font-semibold">Chess Education JAAR @ PUCESI 2025</span>
      </div>
    </footer>
  );
}
