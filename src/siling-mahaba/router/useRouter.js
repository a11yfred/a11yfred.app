// TODO: replace with Remix hooks
// import { useNavigate, useLocation } from '@remix-run/react'
//
// export function useRouter() {
//   const navigate = useNavigate()
//   const location = useLocation()
//   return {
//     route: location.pathname,
//     navigate: (path) => navigate(path),
//     appName: document.title.split(' | ')[0],
//   }
// }
//
// export function useRouteMatch(pattern) {
//   // Use Remix's useMatches or matchPath from react-router-dom
// }

// Temporary: delegate to siling-labuyo hash router until Remix migration
export { useRouter, useRouteMatch } from '../../siling-labuyo/router/Router.jsx'
