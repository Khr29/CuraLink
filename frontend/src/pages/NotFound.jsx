import React from "react";
import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";
import EmptyState from "../components/EmptyState";

// Catch-all for URLs no route matches, so a mistyped or stale link shows a
// page instead of an empty content area.
const NotFound = () => (
  <div className="flex flex-col items-center justify-center text-center min-h-[50vh]">
    <EmptyState
      icon={SearchX}
      title="Page not found"
      subtitle="The page you're looking for doesn't exist or has moved."
    />
    <Link to="/" className="btn btn-primary mt-2">
      Back to Home
    </Link>
  </div>
);

export default NotFound;
