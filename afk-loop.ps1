# afk-loop.ps1 — Ralph picks up unblocked issues sequentially

Write-Host "Ralph AFK loop starting..."

while ($true) {
    # Fetch all open issues with ready-for-agent label
    $issuesJson = & gh issue list --label "ready-for-agent" --state open --json number,title,body 2>&1
    $issues = $issuesJson | ConvertFrom-Json

    if (-not $issues -or $issues.Count -eq 0) {
        Write-Host "No open issues with ready-for-agent label. Done!"
        break
    }

    # Find the first unblocked issue
    $found = $null

    foreach ($issue in $issues) {
        $number = $issue.number
        $title = $issue.title
        $body = $issue.body

        # Extract issue references from "Blocked by" section
        $blockedSection = ($body -split "## Blocked by")[-1]
        $blockedSection = ($blockedSection -split "## ")[0]

        if ($blockedSection -match "None") {
            $found = $number
            Write-Host "Found unblocked issue: Issue $number - $title"
            break
        }

        $refs = [regex]::Matches($blockedSection, '#(\d+)') | ForEach-Object { $_.Groups[1].Value }

        if ($refs.Count -eq 0) {
            $found = $number
            Write-Host "Found unblocked issue: Issue $number - $title"
            break
        }

        # Check if all blockers are closed
        $allClosed = $true
        foreach ($ref in $refs) {
            $stateJson = & gh issue view $ref --json state 2>&1
            $stateObj = $stateJson | ConvertFrom-Json
            if ($stateObj.state -ne "CLOSED") {
                $allClosed = $false
                break
            }
        }

        if ($allClosed) {
            $found = $number
            Write-Host "Found unblocked issue: Issue $number - $title"
            break
        }
    }

    if (-not $found) {
        Write-Host "All remaining issues are blocked. Waiting 5 minutes..."
        Start-Sleep -Seconds 300
        continue
    }

    Write-Host "=== Working on issue $found ==="

    # Run opencode with Ralph as default agent
    $prompt = "Read GitHub issue $found. Implement the full vertical slice described in the issue. Follow your workflow: explore, implement, test, typecheck, lint, commit, close the issue. Then report what you did."
    & opencode $prompt

    Write-Host "=== Issue $found complete ==="
    Write-Host ""
}

Write-Host "All issues complete! Ralph is done."
