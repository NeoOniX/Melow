export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen w-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
      {children}
    </div>
  );
}
