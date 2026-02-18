$baseUrl = "http://localhost:3000/api"

# 1. Login (User)
$userLoginBody = @{
    mobile = "9876543210"
    password = "123456"
} | ConvertTo-Json

try {
    Write-Host "Logging in as User..."
    $userRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $userLoginBody -ContentType "application/json"
    $userToken = $userRes.token
    $initialBalance = $userRes.wallet_balance
    Write-Host "User logged in. Balance: $initialBalance"
} catch {
    Write-Error "User Login failed: $_"
    exit 1
}

# 2. Login (Admin)
$adminLoginBody = @{
    mobile = "9876543210"
    password = "123456"
    is_admin_login = $true
} | ConvertTo-Json

try {
    Write-Host "Logging in as Admin..."
    $adminRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $adminLoginBody -ContentType "application/json"
    $adminToken = $adminRes.token
    Write-Host "Admin logged in."
} catch {
    Write-Error "Admin Login failed: $_"
    exit 1
}

$userHeaders = @{ Authorization = "Bearer $userToken"; "Content-Type" = "application/json" }
$adminHeaders = @{ Authorization = "Bearer $adminToken"; "Content-Type" = "application/json" }

# 3. Create Test Market (Admin)
$marketName = "Test Win Logic Market"
$createBody = @{
    name = $marketName
    open_time = "10:00 AM"
    close_time = "10:00 PM"
    type = "main"
    days_open = @("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
} | ConvertTo-Json

try {
    Write-Host "Creating Market..."
    $marketRes = Invoke-RestMethod -Uri "$baseUrl/markets" -Method Post -Body $createBody -Headers $adminHeaders
    $marketId = $marketRes.data._id
    Write-Host "Market Created: $marketId"
    
    # Verify Market Exists
    try {
        $checkRes = Invoke-RestMethod -Uri "$baseUrl/markets" -Method Get -Headers $adminHeaders
        $createdMarket = $checkRes.data | Where-Object { $_._id -eq $marketId }
        if ($createdMarket) {
            Write-Host "Market verified in list."
        } else {
            Write-Error "Market NOT found in list after creation."
        }
    } catch {
        Write-Error "Failed to list markets."
    }
} catch {
    Write-Error "Market creation failed: $_"
    exit 1
}

# 4. Place Bid (User)
# Open Session, Single Digit '5', 100 points
$bidBody = @{
    game_id = $marketId
    bid_type = "single_digit"
    digit = "5"
    points = 100
    session = "open"
    game_type = "main"
    date = (Get-Date).ToString("yyyy-MM-dd")
} | ConvertTo-Json

try {
    Write-Host "Placing Bid (Single Digit '5')..."
    $bidRes = Invoke-RestMethod -Uri "$baseUrl/bids/place" -Method Post -Body $bidBody -Headers $userHeaders
    Write-Host "Bid Placed. New Balance: $($bidRes.balance)"
} catch {
    Write-Error "Bid placement failed: $_"
    exit 1
}

# 5. Declare Result (Admin)
# Result: Open Panna 122, Open Digit 5 (WIN!)
$resultBody = @{
    result = @{
        open_panna = "122"
        open_digit = "5"
        close_panna = "***"
        close_digit = "*"
    }
} | ConvertTo-Json -Depth 5

try {
    Write-Host "Declaring Result (Open Digit 5)..."
    Write-Host "URL: $baseUrl/markets/$marketId"
    Invoke-RestMethod -Uri "$baseUrl/markets/$marketId" -Method Patch -Body $resultBody -Headers $adminHeaders
    Write-Host "Result Declared."
} catch {
    Write-Error "Result declaration failed: $_"
    exit 1
}

# 6. Check Balance (User)
# Should be Initial - 100 + (100 * 10) = Initial + 900
try {
    Start-Sleep -Seconds 2
    Write-Host "Checking Final Balance..."
    $finalUserRes = Invoke-RestMethod -Uri "$baseUrl/auth/profile" -Method Get -Headers $userHeaders
    $finalBalance = $finalUserRes.user.wallet_balance
    
    Write-Host "Final Balance: $finalBalance"
    
    # Expected: Initial (assuming no other txns) - 100 (bid) + 1000 (win) 
    # But note: initialBalance captured at step 1 might differ if other ops happened.
    # We mainly want to see *increase*.
    
    if ($finalBalance -gt $initialBalance) {
         Write-Host "SUCCESS: Balance increased (Win processed)."
    } else {
         Write-Error "FAILURE: Balance did not increase."
    }
} catch {
    Write-Error "Balance check failed: $_"
}

# 7. Cleanup
try {
    Invoke-RestMethod -Uri "$baseUrl/markets/$marketId" -Method Delete -Headers $adminHeaders
    Write-Host "Cleanup done."
} catch {
    Write-Host "Cleanup failed."
}
