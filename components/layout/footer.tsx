export function Footer() {
  return (
    <footer className="border-t bg-background py-4 text-center text-sm text-muted-foreground">
      <div className="container">
        <p>© {new Date().getFullYear()} Company Name. All rights reserved.</p>
      </div>
    </footer>
  )
}
