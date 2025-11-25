import { useState } from 'react';
import { adminAPI } from '../lib/api';

export default function UnauthorizedTestPage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setResult('');
    
    try {
      // Try to access an admin endpoint without proper token
      // This should return 403
      await adminAPI.getUsers();
      setResult('Unexpected: Request succeeded');
    } catch (error) {
      if (error.response?.status === 403) {
        setResult('✅ Expected 403 Forbidden - Test passed!');
      } else if (error.response?.status === 401) {
        setResult('✅ Expected 401 Unauthorized - Test passed!');
      } else {
        setResult(`❌ Unexpected error: ${error.response?.status || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dev/Test: Unauthorized 403 Test</h1>
        <p className="text-sm text-gray-600 mt-2">
          Trang này dùng để kiểm tra xử lý lỗi xác thực và phân quyền. Giúp đảm bảo hệ thống bảo mật hoạt động đúng.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md border-2 border-gray-200 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Mục đích</h2>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>Kiểm tra xem hệ thống có từ chối truy cập trái phép không</li>
            <li>Xác minh middleware authentication/authorization hoạt động đúng</li>
            <li>Test các trường hợp 401 (Unauthorized) và 403 (Forbidden)</li>
          </ul>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Cách hoạt động</h2>
          <p className="text-sm text-gray-700 mb-2">
            Khi nhấn nút bên dưới, hệ thống sẽ thử gọi API admin mà không có token hợp lệ hoặc không đủ quyền.
          </p>
          <p className="text-sm text-gray-700">
            <strong>Kết quả mong đợi:</strong> Hệ thống sẽ trả về lỗi 401 (Unauthorized) hoặc 403 (Forbidden) thay vì cho phép truy cập.
          </p>
        </div>
        
        <button
          onClick={handleTest}
          disabled={loading}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors shadow-md font-medium"
        >
          {loading ? 'Đang kiểm tra...' : 'Test Unauthorized Access'}
        </button>

        {result && (
          <div className={`mt-4 p-4 rounded-lg ${
            result.includes('✅') 
              ? 'bg-green-50 border-2 border-green-200 text-green-800'
              : 'bg-red-50 border-2 border-red-200 text-red-800'
          }`}>
            <strong>Kết quả:</strong> {result}
          </div>
        )}
      </div>
    </div>
  );
}

