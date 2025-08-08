import { useState, useRef, type ChangeEvent, type KeyboardEvent } from "react";
import { Socket } from "socket.io-client";

interface MessageInputProps {
    socket: Socket | null;
    currentChannel: string;
    username: string;
}

export default function MessageInput({ socket, currentChannel, username }: MessageInputProps) {
    const [message, setMessage] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) setFile(e.target.files[0]);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
    };

    const sendMessage = async () => {
        if (!username || !socket) return alert("You must be logged in!");
        if (!message.trim() && !file) return;

        let uploadedFileUrl: string | undefined;
        let uploadedFileName: string | undefined;

        if (file) {
            const formData = new FormData();
            formData.append("file", file);

            try {
                const res = await fetch("http://localhost:3001/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) {
                    alert("File upload failed");
                    return;
                }

                const data = await res.json();
                uploadedFileUrl = data.url;
                uploadedFileName = data.originalName;
            } catch {
                alert("Upload error");
                return;
            }
        }

        socket.emit("send_message", {
            channel: currentChannel,
            message,
            fileUrl: uploadedFileUrl,
            fileName: uploadedFileName,
        });

        setMessage("");
        setFile(null);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    return (
        <div
            className={`
        p-2 md:p-4 border-t border-[#202225] flex gap-2 items-center bg-[#40444B]
        ${dragOver ? "bg-blue-900/20 border border-blue-600" : ""}
      `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
            <input
                type="text"
                placeholder="Message"
                className="flex-1 p-2 text-sm md:text-base rounded bg-[#202225] text-white focus:outline-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.gif,.png,.jpg,.jpeg,.webp"
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                title="Upload Image"
                className="text-gray-400 hover:text-white transition p-1 md:p-0"
            >
                📎
            </button>
            <button
                onClick={sendMessage}
                className="bg-blue-600 px-3 py-1 md:px-4 md:py-2 rounded hover:bg-blue-700 font-semibold transition text-sm md:text-base"
                disabled={!message.trim() && !file}
            >
                Send
            </button>
        </div>
    );
}