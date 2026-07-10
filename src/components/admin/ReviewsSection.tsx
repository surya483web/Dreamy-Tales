import React, { useState, useEffect } from "react";
import { Save, Plus, Trash2, Edit2, CheckCircle, X } from "lucide-react";
import { ClientReview } from "../../types";
import { AdminMediaUpload } from "./AdminMediaUpload";

interface ReviewsSectionProps {
  initialReviews?: ClientReview[];
  onSave: (reviews: ClientReview[]) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ initialReviews = [], onSave }) => {
  const [reviews, setReviews] = useState<ClientReview[]>(initialReviews);
  const [isSaved, setIsSaved] = useState(true);

  // New review form / editing review form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    clientName: "",
    leftImage: "",
    rightImage: "",
    text: "",
  });

  useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  const handleSaveReview = () => {
    const clientName = formState.clientName.trim();
    const text = formState.text.trim();
    if (!clientName || !text) {
      alert("Please provide at least a Client Name and Testimonial text.");
      return;
    }

    const images: string[] = [];
    if (formState.leftImage.trim()) images.push(formState.leftImage.trim());
    if (formState.rightImage.trim()) images.push(formState.rightImage.trim());

    if (editingId) {
      // Edit existing review
      setReviews((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? { ...r, clientName, text, images }
            : r
        )
      );
      setEditingId(null);
    } else {
      // Create new review
      const newReviewItem: ClientReview = {
        id: `review-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        clientName,
        text,
        images,
      };
      setReviews((prev) => [newReviewItem, ...prev]);
    }

    // Reset form
    setFormState({
      clientName: "",
      leftImage: "",
      rightImage: "",
      text: "",
    });
    setIsSaved(false);
  };

  const handleEditClick = (review: ClientReview) => {
    setEditingId(review.id);
    setFormState({
      clientName: review.clientName,
      leftImage: review.images[0] || "",
      rightImage: review.images[1] || "",
      text: review.text,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormState({
      clientName: "",
      leftImage: "",
      rightImage: "",
      text: "",
    });
  };

  const handleRemoveReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setIsSaved(false);
  };

  const handleSaveAll = () => {
    onSave(reviews);
    setIsSaved(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-serif text-gold font-semibold">Client Praise &amp; Love (Testimonials)</h3>
          <p className="text-xs text-zinc-400">Manage client feedbacks, including names, testimonial copy, and couple photos.</p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={isSaved}
          className={`px-4 py-2 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
            isSaved
              ? "bg-zinc-800 text-zinc-500 cursor-default"
              : "bg-gold hover:bg-gold-dark text-luxury-black font-semibold hover:text-white"
          }`}
        >
          <Save className="w-3.5 h-3.5" />
          {isSaved ? "Saved" : "Apply Changes"}
        </button>
      </div>

      {/* Editor Form */}
      <div className="bg-white/2 border border-white/5 p-5 rounded-lg space-y-4">
        <h4 className="text-xs uppercase tracking-wider text-gold font-bold flex items-center justify-between">
          <span>{editingId ? "Edit Testimonial Details" : "Add Client Review / Testimonial"}</span>
          {editingId && (
            <button
              onClick={handleCancelEdit}
              className="text-[9px] uppercase tracking-wider text-red-400 hover:text-red-300 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" /> Cancel Edit
            </button>
          )}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-4">
            {/* Client Name */}
            <div className="space-y-1">
              <label htmlFor="review-clientName" className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                Client Name(s)
              </label>
              <input
                id="review-clientName"
                type="text"
                value={formState.clientName}
                onChange={(e) => setFormState((prev) => ({ ...prev, clientName: e.target.value }))}
                placeholder="E.g. Krishna &amp; Omar"
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50 font-medium"
              />
            </div>

            {/* Review text */}
            <div className="space-y-1">
              <label htmlFor="review-text" className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                Testimonial Review Text
              </label>
              <textarea
                id="review-text"
                value={formState.text}
                onChange={(e) => setFormState((prev) => ({ ...prev, text: e.target.value }))}
                rows={4}
                placeholder="Write the couple's beautiful feedback here..."
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50 font-sans"
              />
            </div>
          </div>

          <div className="space-y-4">
            {/* Left Image */}
            <AdminMediaUpload
              id="review-left"
              label="Left Image (Portrait 3:4 Ratio)"
              value={formState.leftImage}
              onChange={(url) => setFormState((prev) => ({ ...prev, leftImage: url }))}
              accept="image/*"
            />

            {/* Right Image */}
            <AdminMediaUpload
              id="review-right"
              label="Right Image (Portrait 3:4 Ratio)"
              value={formState.rightImage}
              onChange={(url) => setFormState((prev) => ({ ...prev, rightImage: url }))}
              accept="image/*"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            id="save-review-btn"
            onClick={handleSaveReview}
            className="px-6 py-2 bg-gold hover:bg-gold-dark text-luxury-black font-bold uppercase text-[10px] tracking-wider rounded transition-all cursor-pointer"
          >
            {editingId ? "Update Review Details" : "Confirm Review Post"}
          </button>
        </div>
      </div>

      {/* Testimonials List */}
      <div className="space-y-4">
        <h4 className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
          Active Testimonials Listing ({reviews.length})
        </h4>

        {reviews.length === 0 ? (
          <p className="text-xs text-zinc-500 italic text-center py-6 border border-white/5 bg-white/2 rounded-lg">
            No reviews added yet. Add a feedback above.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((review) => (
              <div key={review.id} className="border border-white/5 bg-white/1 rounded-lg p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-serif text-gold text-sm font-bold uppercase tracking-wide">
                      {review.clientName}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditClick(review)}
                        className="p-1.5 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 rounded cursor-pointer"
                        title="Edit Review"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveReview(review.id)}
                        className="p-1.5 bg-zinc-900/60 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 border border-white/5 rounded cursor-pointer"
                        title="Delete Review"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-300 italic line-clamp-4 font-sans">
                    "{review.text}"
                  </p>
                </div>

                {/* Images row */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 pt-2 border-t border-white/5">
                    {review.images.map((img, idx) => (
                      <div key={idx} className="w-12 h-16 bg-zinc-900 rounded overflow-hidden border border-white/10 flex-shrink-0">
                        <img src={img} alt={`Couple Portrait ${idx + 1}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
