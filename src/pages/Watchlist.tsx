import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, LogIn, Trash2 } from "lucide-react";
import { useWatchlist } from "@/hooks/useWatchlist";
import { AuthModal } from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const WatchlistContent = () => {
    const {
        items,
        isLoading,
        error,
        removeFromWatchlist,
        pendingCount,
        syncStatus,
    } = useWatchlist();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(!!auth.currentUser);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsLoggedIn(!!user);
        });
        return unsubscribe;
    }, []);

    const sortedItems = useMemo(
        () =>
            [...items].sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0)),
        [items]
    );

    const handleRemove = async (movieId: string) => {
        if (!isLoggedIn) {
            setIsAuthModalOpen(true);
            return;
        }
        await removeFromWatchlist(movieId);
    };

    const showEmptyState = !isLoading && sortedItems.length === 0;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b border-border bg-gradient-to-r from-background to-muted/30">
                <div className="container mx-auto flex flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-muted-foreground">
                            <Bookmark className="h-4 w-4 text-gold" />
                            Watchlist
                        </p>
                        <CardTitle className="text-3xl font-display md:text-4xl">Saved Movies</CardTitle>
                        <CardDescription className="max-w-2xl text-base">
                            View and manage the movies you have saved to your watchlist. Changes sync
                            to your account when you are signed in.
                        </CardDescription>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                Status: {syncStatus}
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-amber-400" />
                                Pending: {pendingCount}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/">
                            <Button variant="outline">Back to films</Button>
                        </Link>
                        {isLoggedIn ? (
                            <Badge variant="secondary" className="self-center">
                                Signed in
                            </Badge>
                        ) : (
                            <Button
                                variant="goldOutline"
                                onClick={() => setIsAuthModalOpen(true)}
                                className="gap-2"
                            >
                                <LogIn className="h-4 w-4" />
                                Sign in to sync
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-10">
                {error && (
                    <div className="mb-6 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                {!isLoggedIn && (
                    <Card className="mb-8 border-dashed">
                        <CardHeader>
                            <CardTitle className="text-xl">Sign in to keep your watchlist in sync</CardTitle>
                            <CardDescription>
                                Saving while signed out stores items locally. Sign in to sync across devices and
                                keep your list safe.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="gold" onClick={() => setIsAuthModalOpen(true)} className="gap-2">
                                <LogIn className="h-4 w-4" />
                                Open sign in
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {isLoading && (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, idx) => (
                            <Card key={idx} className="overflow-hidden">
                                <div className="h-48 w-full animate-pulse bg-muted" />
                                <CardContent className="space-y-3">
                                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                                    <div className="h-10 w-24 animate-pulse rounded bg-muted" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {showEmptyState && (
                    <Card className="border-dashed text-center">
                        <CardHeader className="items-center">
                            <CardTitle className="text-2xl">Your watchlist is empty</CardTitle>
                            <CardDescription className="max-w-md">
                                Browse movies and tap the bookmark to add them here. Sign in to keep them backed up.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                            <Button asChild variant="gold">
                                <Link to="/">Find movies</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {!isLoading && sortedItems.length > 0 && (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {sortedItems.map((item) => (
                            <Card key={item.id} className="group overflow-hidden border-border/70">
                                <div className="relative h-56 w-full bg-muted/50">
                                    {item.poster ? (
                                        <img
                                            src={item.poster}
                                            alt={item.title}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-muted-foreground">
                                            <Bookmark className="h-8 w-8" />
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 via-background/70 to-transparent p-3">
                                        <Badge variant={item.syncStatus === "pending" ? "secondary" : "outline"}>
                                            {item.syncStatus === "pending" ? "Pending sync" : "Synced"}
                                        </Badge>
                                    </div>
                                </div>
                                <CardHeader className="space-y-2">
                                    <CardTitle className="text-xl leading-tight">{item.title}</CardTitle>
                                    <CardDescription>
                                        Added {new Date(item.addedAt).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex items-center justify-between">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => handleRemove(item.movieId)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Remove
                                    </Button>
                                    {item.watched ? (
                                        <Badge variant="outline">Watched</Badge>
                                    ) : (
                                        <Badge variant="secondary">Planned</Badge>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </div>
    );
};

export default function WatchlistPage() {
    return (
        <ThemeProvider>
            <WatchlistContent />
        </ThemeProvider>
    );
}
