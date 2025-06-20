"use client"

import theme from "../styles/theme"

function Layout({ children }) {
  return (
    <div className="page-wrapper">
      {children}
      <style jsx global>{`
        body {
          background: ${theme.colors.background};
          color: ${theme.colors.text};
          font-family: ${theme.fontFamily.sansSerif};
          margin: 0;
          padding: 0;
          font-size: 16px;
          line-height: 1.6;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}

export default Layout
