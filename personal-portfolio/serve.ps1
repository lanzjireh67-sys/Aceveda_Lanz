# Minimal local static server for environments without Python or Node.
$root = Split-Path -Parent $PSCommandPath
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add('http://localhost:5500/')
$listener.Start()

while ($listener.IsListening) {
  $context = $listener.GetContext()
  $requested = $context.Request.Url.AbsolutePath.TrimStart('/')
  if ([string]::IsNullOrWhiteSpace($requested)) { $requested = 'index.html' }
  $resolved = [System.IO.Path]::GetFullPath((Join-Path $root $requested))

  if (-not $resolved.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $resolved -PathType Leaf)) {
    $context.Response.StatusCode = 404
    $content = [System.Text.Encoding]::UTF8.GetBytes('Not found')
    $context.Response.OutputStream.Write($content, 0, $content.Length)
    $context.Response.Close()
    continue
  }

  $extension = [System.IO.Path]::GetExtension($resolved).ToLowerInvariant()
  $mime = @{ '.html' = 'text/html; charset=utf-8'; '.css' = 'text/css; charset=utf-8'; '.js' = 'application/javascript; charset=utf-8'; '.svg' = 'image/svg+xml' }[$extension]
  if (-not $mime) { $mime = 'application/octet-stream' }
  $content = [System.IO.File]::ReadAllBytes($resolved)
  $context.Response.ContentType = $mime
  $context.Response.ContentLength64 = $content.Length
  $context.Response.OutputStream.Write($content, 0, $content.Length)
  $context.Response.Close()
}
