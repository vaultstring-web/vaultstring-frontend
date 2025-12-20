module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/Desktop/VaultString/Projects/vaultstring-frontend/src/lib/api/api-client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "apiFetch",
    ()=>apiFetch,
    "default",
    ()=>__TURBOPACK__default__export__,
    "delay",
    ()=>delay,
    "getToken",
    ()=>getToken,
    "getUser",
    ()=>getUser,
    "isAuthenticated",
    ()=>isAuthenticated,
    "setToken",
    ()=>setToken,
    "setUser",
    ()=>setUser
]);
const GATEWAY = ("TURBOPACK compile-time value", "http://127.0.0.1:9000") || '';
const API_BASE = ("TURBOPACK compile-time truthy", 1) ? `${GATEWAY.replace(/\/$/, '')}/api/v1` : "TURBOPACK unreachable";
const TOKEN_KEY = 'kyd_access_token';
const USER_KEY = 'kyd_user_profile';
function isAuthenticated() {
    return !!getToken();
}
function getToken() {
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
}
function setToken(token) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
function getUser() {
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
    const raw = undefined;
}
function setUser(user) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
async function apiFetch(path, init = {}) {
    const url = ("TURBOPACK compile-time truthy", 1) ? `${API_BASE.replace(/\/$/, '')}${path.startsWith('/') ? path : '/' + path}` : "TURBOPACK unreachable";
    const headers = {
        'Content-Type': 'application/json',
        ...init.headers || {}
    };
    const token = getToken();
    const openAuthPaths = [
        '/auth/login',
        '/auth/register',
        '/auth/password/reset',
        '/auth/password/reset/confirm',
        '/auth/verify',
        '/auth/verify/resend',
        '/auth/magic-link'
    ];
    const shouldAttachAuth = token && !headers['Authorization'] && !openAuthPaths.some((p)=>path.startsWith(p));
    if (shouldAttachAuth) headers['Authorization'] = `Bearer ${token}`;
    const method = String(init.method || 'GET').toUpperCase();
    const unsafe = method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';
    const requiresIdempotency = unsafe && !openAuthPaths.some((p)=>path.startsWith(p));
    if (requiresIdempotency && !headers['Idempotency-Key']) {
        headers['Idempotency-Key'] = generateIdempotencyKey();
    }
    let res;
    let text = '';
    try {
        res = await fetch(url, {
            ...init,
            headers,
            credentials: 'include'
        });
        text = await res.text();
    } catch (_err) {
        await delay(300);
        res = await fetch(url, {
            ...init,
            headers,
            credentials: 'include'
        });
        text = await res.text();
    }
    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.toLowerCase().includes('application/json');
    let data = null;
    if (isJson && text) {
        try {
            data = JSON.parse(text);
        } catch  {
            data = null;
        }
    }
    if (!res.ok) {
        const message = data && (data.error || data.message) || text || res.statusText || 'API request failed';
        const err = new Error(String(message));
        err.status = res.status;
        err.data = data ?? text ?? null;
        throw err;
    }
    return data ?? (isJson ? null : text || null);
}
function delay(ms = 500) {
    return new Promise((r)=>setTimeout(r, ms));
}
function generateIdempotencyKey() {
    try {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    } catch  {}
    return `web-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
const __TURBOPACK__default__export__ = {
    apiFetch,
    delay,
    getToken,
    setToken,
    getUser,
    setUser
};
}),
"[project]/Desktop/VaultString/Projects/vaultstring-frontend/src/context/AuthContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$VaultString$2f$Projects$2f$vaultstring$2d$frontend$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/VaultString/Projects/vaultstring-frontend/node_modules/.pnpm/next@16.0.8_react-dom@19.2.1_react@19.2.1__react@19.2.1/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$VaultString$2f$Projects$2f$vaultstring$2d$frontend$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/VaultString/Projects/vaultstring-frontend/node_modules/.pnpm/next@16.0.8_react-dom@19.2.1_react@19.2.1__react@19.2.1/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$VaultString$2f$Projects$2f$vaultstring$2d$frontend$2f$src$2f$lib$2f$api$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/VaultString/Projects/vaultstring-frontend/src/lib/api/api-client.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$VaultString$2f$Projects$2f$vaultstring$2d$frontend$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
    user: null,
    setUser: ()=>{}
});
function AuthProvider({ children }) {
    const [user, setUserState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$VaultString$2f$Projects$2f$vaultstring$2d$frontend$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$VaultString$2f$Projects$2f$vaultstring$2d$frontend$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$VaultString$2f$Projects$2f$vaultstring$2d$frontend$2f$src$2f$lib$2f$api$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getToken"])();
        const raw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$VaultString$2f$Projects$2f$vaultstring$2d$frontend$2f$src$2f$lib$2f$api$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUser"])();
        if (token && raw) {
            const name = raw?.first_name && raw?.last_name ? `${raw.first_name} ${raw.last_name}` : raw?.name || raw?.email || 'User';
            const country = String(raw?.country_code || '').toUpperCase();
            const type = String(raw?.user_type || '').toLowerCase();
            let accountLabel = 'Personal Account';
            if (country === 'MW' && type === 'individual') accountLabel = 'Sender (Malawi)';
            else if (country === 'CN' && (type === 'merchant' || type === 'agent')) accountLabel = 'Receiver (China)';
            else if (type === 'merchant') accountLabel = 'Business Account';
            else if (type === 'agent') accountLabel = 'Agent Account';
            const profile = {
                name,
                email: String(raw?.email || ''),
                phone: String(raw?.phone || ''),
                kycStatus: 'verified',
                avatarUrl: '/icons/avatar-default.png',
                accountLabel,
                countryCode: country,
                userType: type
            };
            setUserState(profile);
        }
    }, []);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$VaultString$2f$Projects$2f$vaultstring$2d$frontend$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            user,
            setUser: (u)=>{
                setUserState(u);
            }
        }), [
        user
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$VaultString$2f$Projects$2f$vaultstring$2d$frontend$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/VaultString/Projects/vaultstring-frontend/src/context/AuthContext.tsx",
        lineNumber: 51,
        columnNumber: 10
    }, this);
}
function useAuth() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$VaultString$2f$Projects$2f$vaultstring$2d$frontend$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
}
}),
"[project]/Desktop/VaultString/Projects/vaultstring-frontend/node_modules/.pnpm/next@16.0.8_react-dom@19.2.1_react@19.2.1__react@19.2.1/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        if ("TURBOPACK compile-time truthy", 1) {
            if ("TURBOPACK compile-time truthy", 1) {
                module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)");
            } else //TURBOPACK unreachable
            ;
        } else //TURBOPACK unreachable
        ;
    }
} //# sourceMappingURL=module.compiled.js.map
}),
"[project]/Desktop/VaultString/Projects/vaultstring-frontend/node_modules/.pnpm/next@16.0.8_react-dom@19.2.1_react@19.2.1__react@19.2.1/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/Desktop/VaultString/Projects/vaultstring-frontend/node_modules/.pnpm/next@16.0.8_react-dom@19.2.1_react@19.2.1__react@19.2.1/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
"[project]/Desktop/VaultString/Projects/vaultstring-frontend/node_modules/.pnpm/next@16.0.8_react-dom@19.2.1_react@19.2.1__react@19.2.1/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/Desktop/VaultString/Projects/vaultstring-frontend/node_modules/.pnpm/next@16.0.8_react-dom@19.2.1_react@19.2.1__react@19.2.1/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].React; //# sourceMappingURL=react.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4631dbff._.js.map