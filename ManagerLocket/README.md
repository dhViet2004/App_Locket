# ManagerLocket - Giao diện quản lý Locket

Đây là giao diện web quản lý cho ứng dụng Locket, được xây dựng bằng React + TypeScript + Vite.

## Yêu cầu hệ thống

- Node.js (phiên bản 18 trở lên)
- npm hoặc yarn

## Cách cài đặt và chạy dự án

### 1. Cài đặt dependencies

```bash
# Sử dụng npm
npm install

# Hoặc sử dụng yarn
yarn install
```

### 2. Chạy dự án ở chế độ development

```bash
# Sử dụng npm
npm run dev

# Hoặc sử dụng yarn
yarn dev
```

Sau khi chạy lệnh trên, ứng dụng sẽ được khởi động tại địa chỉ: `http://localhost:5173`

### 3. Build dự án cho production

```bash
# Sử dụng npm
npm run build

# Hoặc sử dụng yarn
yarn build
```

### 4. Xem trước dự án đã build

```bash
# Sử dụng npm
npm run preview

# Hoặc sử dụng yarn
yarn preview
```

### 5. Kiểm tra code với ESLint

```bash
# Sử dụng npm
npm run lint

# Hoặc sử dụng yarn
yarn lint
```

## Cấu trúc dự án

```
ManagerLocket/
├── src/
│   ├── App.tsx          # Component chính
│   ├── main.tsx         # Entry point
│   ├── App.css          # Styles cho App
│   └── index.css        # Global styles
├── public/              # Static files
├── package.json         # Dependencies và scripts
├── vite.config.ts       # Cấu hình Vite
└── tsconfig.json        # Cấu hình TypeScript
```

## Tính năng

- ⚡ Vite - Build tool nhanh
- ⚛️ React 19 - Framework UI hiện đại
- 🔷 TypeScript - Type safety
- 🎨 CSS với hỗ trợ dark/light theme
- 🔍 ESLint - Code quality

## Phát triển

Dự án sử dụng Vite với plugin React để có Hot Module Replacement (HMR) nhanh chóng trong quá trình phát triển.

## Liên kết hữu ích

- [Vite Documentation](https://vite.dev/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
