"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";


export default function LoginPage() {
    const router = useRouter();
    const [userid, setUserid] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!userid || !password) {
            setError("Please enter username and password.");
            return;
        }
        

        setLoading(true);
        try {
            // fake auth delay
            // await new Promise((r) => setTimeout(r, 700));

            const response = await fetch(`/api/users/${userid}/`)
            console.log(await response.json())
            // demo credentials: user@example.com / password
            if (response.ok) {
                router.push(`/${userid}/dashboard`); // on success redirect
                // const result = await fetch(`/api/users/${userid}/`)
                // console.log(await result.json())
            } else {
                setError("Invalid email or password.");
            }
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <main style={styles.page}>
            <form onSubmit={handleSubmit} style={styles.card} aria-labelledby="login-heading">
                <h1 id="login-heading" style={styles.title}>Sign in</h1>

                {error && <div role="alert" style={styles.error}>{error}</div>}

                <label style={styles.label}>
                    Email
                    <input
                        type="string"
                        value={userid}
                        onChange={(e) => setUserid(e.target.value)}
                        style={styles.input}
                        autoComplete="email"
                        required
                    />
                </label>

                <label style={styles.label}>
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        autoComplete="current-password"
                        required
                        minLength={6}
                    />
                </label>

                <button type="submit" style={{ ...styles.button, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                </button>

                <p style={styles.hint}>
                    Demo credentials: <strong>user@example.com</strong> / <strong>password</strong>
                </p>
            </form>
        </main>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f7fb",
        padding: 20,
    },
    card: {
        width: 360,
        maxWidth: "100%",
        background: "#fff",
        borderRadius: 8,
        padding: 24,
        boxShadow: "0 6px 20px rgba(16,24,40,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
    },
    title: {
        margin: 0,
        fontSize: 20,
        fontWeight: 600,
        color: "#111827",
    },
    label: {
        display: "flex",
        flexDirection: "column",
        fontSize: 13,
        color: "#374151",
        gap: 6,
    },
    input: {
        height: 40,
        padding: "8px 10px",
        borderRadius: 6,
        border: "1px solid #e5e7eb",
        outline: "none",
        fontSize: 14,
    },
    button: {
        marginTop: 6,
        height: 42,
        borderRadius: 6,
        border: "none",
        background: "#2563eb",
        color: "#fff",
        fontWeight: 600,
        cursor: "pointer",
    },
    error: {
        color: "#b91c1c",
        background: "#fff1f2",
        padding: "8px 10px",
        borderRadius: 6,
        fontSize: 13,
    },
    hint: {
        marginTop: 6,
        fontSize: 12,
        color: "#6b7280",
    },
};