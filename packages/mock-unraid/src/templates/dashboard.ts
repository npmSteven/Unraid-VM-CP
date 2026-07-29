export function renderDashboardHtml(csrfToken: string): string {
  return `<!DOCTYPE html>
<html>
<head><title>Unraid OS</title></head>
<body>
  <form id="dashboard_form">
    <input type="hidden" name="csrf_token" value="${csrfToken}" />
  </form>
</body>
</html>`;
}
