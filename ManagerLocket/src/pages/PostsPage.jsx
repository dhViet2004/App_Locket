import { useState, useEffect } from 'react';
import { adminAPI } from '../lib/api';
import apiClient from '../lib/axios';
import Pagination from '../components/common/Pagination';
import { Trash2, Eye, MessageSquare, Heart, Image as ImageIcon, X, Calendar, User, MapPin } from 'lucide-react';

const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    return () => observer.disconnect();
  }, []);

  return isDarkMode;
};

export default function PostsPage() {
  const isDarkMode = useDarkMode();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postDetail, setPostDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const limit = 10;

  useEffect(() => {
    loadPosts();
  }, [page]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getPosts({ page, limit: 20 });
      // Backend response format: { success: true, data: { items: [], pagination: {} } }
      setPosts(response.data?.items || []);
      setTotalPages(response.data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to load posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPost = async (postId) => {
    setSelectedPost(postId);
    setLoadingDetail(true);
    try {
      const response = await apiClient.get(`/api/posts/${postId}`);
      setPostDetail(response.data?.data || response.data);
    } catch (error) {
      console.error('Failed to load post detail:', error);
      alert('Failed to load post details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedPost(null);
    setPostDetail(null);
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await adminAPI.deletePost(postId);
      // Update local state instead of reloading
      setPosts(posts.filter(post => post._id !== postId));
      setTotal(total - 1);
      // Close detail modal if viewing deleted post
      if (selectedPost === postId) {
        handleCloseDetail();
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    }).replace(/ /g, '\n');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} uppercase tracking-wider transition-colors`}>Posts Management</h1>
        <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} mt-1 transition-colors`}>Content Overview</p>
      </div>

      <div className={`${isDarkMode ? 'bg-[#151A25] border-gray-800/50' : 'bg-white border-gray-200'} rounded-2xl border overflow-hidden shadow-xl transition-colors`}>
        {loading ? (
          <div className={`p-12 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} transition-colors`}>Loading posts...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-gray-800/50 text-gray-500' : 'border-gray-200 text-gray-600'} text-xs font-bold uppercase tracking-wider transition-colors`}>
                  <th className="px-6 py-5">#</th>
                  <th className="px-6 py-5">Image</th>
                  <th className="px-6 py-5">Author</th>
                  <th className="px-6 py-5">Content</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5">Engagement</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800/50' : 'divide-gray-200'} text-sm transition-colors`}>
                {posts.map((post, index) => (
                  <tr key={post._id} className={`${isDarkMode ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50'} transition-colors group`}>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} transition-colors`}>#{index + 1 + (page - 1) * limit}</td>
                    <td className="px-6 py-4">
                      <div className={`w-12 h-12 rounded-lg ${isDarkMode ? 'bg-[#1E2532] border-gray-700' : 'bg-gray-100 border-gray-300'} border overflow-hidden flex items-center justify-center transition-colors`}>
                        {post.imageUrl ? (
                          <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} transition-colors`} />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-bold ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} cursor-pointer transition-colors`}>
                        {post.author?.username || 'Unknown'}
                      </div>
                    </td>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'} max-w-xs truncate transition-colors`}>
                      {post.caption || 'No caption'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-md text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                        Published
                      </span>
                    </td>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'} whitespace-pre-line transition-colors`}>
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-pink-500">
                          <Heart className="w-3.5 h-3.5" />
                          <span className="font-bold text-xs">{post.likes?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-blue-500">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="font-bold text-xs">{post.comments?.length || 0}</span>
                        </div>
                      </div>
                      <div className={`w-24 h-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-full mt-2 overflow-hidden transition-colors`}>
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 to-blue-500"
                          style={{ width: `${Math.min(((post.likes?.length || 0) + (post.comments?.length || 0)) * 2, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleViewPost(post._id)}
                          className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#1E2532] text-gray-400 hover:text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:text-blue-600 hover:bg-gray-200'} transition-colors`}
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#1E2532] text-gray-400 hover:text-red-500 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:text-red-600 hover:bg-gray-200'} transition-colors`}
                          title="Delete post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className={`p-6 border-t ${isDarkMode ? 'border-gray-800/50' : 'border-gray-200'} flex justify-end transition-colors`}>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onPageChange={setPage}
            darkMode={isDarkMode}
          />
        </div>
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={handleCloseDetail}
        >
          <div
            className={`${isDarkMode ? 'bg-[#151A25] border-gray-800' : 'bg-white border-gray-200'} rounded-2xl border shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in transition-colors`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex justify-between items-center p-6 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} transition-colors`}>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>Post Details</h2>
              <button 
                onClick={handleCloseDetail}
                className={`${isDarkMode ? 'text-gray-500 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {loadingDetail ? (
              <div className={`p-12 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} transition-colors`}>Loading post details...</div>
            ) : postDetail ? (
              <div className="p-6 space-y-6">
                {/* Image */}
                {postDetail.imageUrl && (
                  <div className="w-full rounded-xl overflow-hidden">
                    <img 
                      src={postDetail.imageUrl} 
                      alt="Post" 
                      className="w-full h-auto max-h-[500px] object-contain bg-gray-100"
                    />
                  </div>
                )}

                {/* Author Info */}
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${isDarkMode ? 'bg-[#1E2532] border-gray-700' : 'bg-gray-100 border-gray-300'} border flex items-center justify-center transition-colors`}>
                    {postDetail.author?.avatarUrl ? (
                      <img src={postDetail.author.avatarUrl} alt={postDetail.author.username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} font-bold`}>
                        {postDetail.author?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>
                      {postDetail.author?.displayName || postDetail.author?.username || 'Unknown'}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} transition-colors`}>
                      @{postDetail.author?.username || 'unknown'}
                    </div>
                  </div>
                </div>

                {/* Caption */}
                {postDetail.caption && (
                  <div>
                    <h3 className={`text-sm font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2 transition-colors`}>Caption</h3>
                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} whitespace-pre-wrap transition-colors`}>
                      {postDetail.caption}
                    </p>
                  </div>
                )}

                {/* Location */}
                {postDetail.location?.name && (
                  <div className="flex items-center gap-2">
                    <MapPin className={`w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} transition-colors`} />
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-700'} transition-colors`}>
                      {postDetail.location.name}
                    </span>
                  </div>
                )}

                {/* Stats */}
                <div className={`grid grid-cols-3 gap-4 p-4 ${isDarkMode ? 'bg-[#0B0E14] border-gray-800' : 'bg-gray-50 border-gray-200'} rounded-xl border transition-colors`}>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-pink-500 mb-1">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>
                      {postDetail.reactionCount || 0}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} transition-colors`}>Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-blue-500 mb-1">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>
                      {postDetail.commentCount || 0}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} transition-colors`}>Comments</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-gray-500 mb-1">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>
                      {new Date(postDetail.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} transition-colors`}>Created</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`p-12 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} transition-colors`}>
                Failed to load post details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
