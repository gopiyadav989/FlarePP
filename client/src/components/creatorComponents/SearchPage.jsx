import React, { useState } from "react";
import { Search } from "lucide-react";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setError(null);

    if (query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3000/api/videos/creator-search-videos?query=${encodeURIComponent(query)}`,
          {
            "credentials": "include",
            headers: {
              'Content-Type': 'application/json',
              
            }
          }
        );
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Search request failed');
        }
        
        if (data.success) {
          setSearchResults(data.videos);
        }
      } catch (error) {
        console.error('Search error:', error);
        setError(error.message);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Search Videos</h1>
        
        {/* Search Input */}
        <div className="relative mb-8">
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={handleSearch}
            autoFocus
            className="w-full bg-zinc-800 rounded-lg pl-10 pr-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-400 mb-4 p-4 bg-red-400/10 rounded-lg">
            {error}
          </div>
        )}

        {/* Search Results */}
        <div className="space-y-4">
          {searchResults.map((video) => (
            <div
              key={video._id}
              className="bg-zinc-800 rounded-lg p-4 hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <div className="flex gap-4">
                <img 
                  src={video.thumbnail || "/api/placeholder/160/90"} 
                  alt={video.title}
                  className="w-40 h-24 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium">{video.title}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm text-zinc-400">
                      {formatDate(video.createdAt)}
                    </span>
                    <span className="text-sm px-2 py-1 rounded-full bg-zinc-700 text-zinc-300">
                      {video.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {searchQuery && !isLoading && searchResults.length === 0 && !error && (
          <div className="text-center text-zinc-400 py-8">
            No videos found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;