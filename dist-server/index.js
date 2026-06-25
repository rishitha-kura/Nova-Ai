"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API routes
app.use('/api', routes_1.default);
// Serve static files
const distPath = path_1.default.join(process.cwd(), 'dist');
app.use(express_1.default.static(distPath));
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(distPath, 'index.html'));
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
