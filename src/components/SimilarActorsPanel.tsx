import { useState } from "react";
import { motion } from "framer-motion";
import { SimilarActor } from "@/data/mockData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Film, Award } from "lucide-react";

interface SimilarActorsPanelProps {
  actors: SimilarActor[];
}

export function SimilarActorsPanel({ actors }: SimilarActorsPanelProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedActor, setSelectedActor] = useState<SimilarActor | null>(null);

  return (
    <section aria-labelledby="similar-actors-heading" className="py-8">
      <h2
        id="similar-actors-heading"
        className="font-display text-3xl text-foreground mb-8 flex items-center gap-3"
      >
        <div className="w-1 h-8 bg-gold rounded-full" />
        Similar Actors
      </h2>

      {/* Grid layout */}
      <div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
        role="list"
        aria-label="Similar actors grid"
      >
        {actors.slice(0, 5).map((actor, index) => (
          <motion.article
            key={actor.id}
            className="group cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onHoverStart={() => setHoveredId(actor.id)}
            onHoverEnd={() => setHoveredId(null)}
            onClick={() => setSelectedActor(actor)}
            role="listitem"
            tabIndex={0}
            aria-label={`${actor.name}, known for ${actor.knownFor}`}
          >
            <div className="relative overflow-hidden rounded-lg mb-4">
              {/* Image container */}
              <div className="aspect-[2/3] overflow-hidden">
                <motion.img
                  src={actor.photo}
                  alt={actor.name}
                  className="w-full h-full object-cover"
                  animate={{
                    scale: hoveredId === actor.id ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Info section */}
            <div className="bg-secondary/50 rounded-lg p-4 border border-border/50 group-hover:border-gold/30 transition-colors">
              <h3 className="font-display text-lg text-foreground group-hover:text-gold transition-colors mb-1">
                {actor.name}
              </h3>
              <p className="text-sm text-muted-foreground font-serif">
                {actor.knownFor}
              </p>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Actor Details Modal */}
      <Dialog
        open={!!selectedActor}
        onOpenChange={() => setSelectedActor(null)}
      >
        <DialogContent className="sm:max-w-[500px] bg-card border-gold/20">
          {selectedActor && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-3xl text-gold">
                  {selectedActor.name}
                </DialogTitle>
                <DialogDescription className="font-serif text-lg italic">
                  Known for: {selectedActor.knownFor}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                <div className="flex gap-6">
                  <div className="w-32 aspect-[2/3] rounded-lg overflow-hidden border-2 border-gold/30 flex-shrink-0">
                    <img
                      src={selectedActor.photo}
                      alt={selectedActor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground/80 font-serif leading-relaxed mb-4">
                      {selectedActor.bio ||
                        "No biography available for this actor."}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Film className="h-4 w-4 text-gold" />
                        <span>
                          {selectedActor.stats?.totalFilms || 0} Films
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Award className="h-4 w-4 text-gold" />
                        <span>
                          {selectedActor.stats?.awardsWon || 0} Awards
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
