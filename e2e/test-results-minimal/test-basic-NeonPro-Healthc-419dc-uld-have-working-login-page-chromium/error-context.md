# Page snapshot

```yaml
- heading "Sign in to NEONPRO" [level=1]
- paragraph: Welcome back! Please sign in to continue
- button "Sign in with Google Continue with Google":
  - img "Sign in with Google"
  - text: Continue with Google
- paragraph: or
- text: Email address
- textbox "Email address"
- text: Password
- textbox "Password"
- button "Show password":
  - img
- button "Continue":
  - text: Continue
  - img
- text: Don’t have an account?
- link "Sign up":
  - /url: https://fair-dane-95.accounts.dev/sign-up#/?redirect_url=https%3A%2F%2Fneonpro.vercel.app%2Flogin
- paragraph: Secured by
- link "Clerk logo":
  - /url: https://go.clerk.com/components
  - img
- paragraph: Development mode
- status "Development environment notification": This is a hosted version of Clerk's <SignIn /> component. Sign in and you'll be redirected back to https://neonpro.vercel.app
- alert
```