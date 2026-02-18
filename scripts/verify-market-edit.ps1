$baseUrl = "http://localhost:3000/api"

# 1. Login
$loginBody = @{
    mobile = "9876543210"
    password = "123456"
    is_admin_login = $true
} | ConvertTo-Json

try {
    Write-Host "Logging in..."
    $loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginRes.token
    Write-Host "Login successful."
} catch {
    Write-Error "Login failed: $_"
    exit 1
}

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

# 2. Create Market
$createBody = @{
    name = "Test Market"
    open_time = "10:00 AM"
    close_time = "12:00 PM"
    type = "main"
    days_open = @("Mon", "Tue")
} | ConvertTo-Json

try {
    Write-Host "Creating market..."
    $createRes = Invoke-RestMethod -Uri "$baseUrl/markets" -Method Post -Body $createBody -Headers $headers
    $marketId = $createRes.data._id
    Write-Host "Market created. ID: $marketId"
} catch {
    Write-Error "Create market failed: $_"
    exit 1
}

# 3. Update Market
$updateBody = @{
    name = "Updated Test Market"
    open_time = "11:00 AM"
} | ConvertTo-Json

try {
    Write-Host "Updating market..."
    $updateRes = Invoke-RestMethod -Uri "$baseUrl/markets/$marketId" -Method Patch -Body $updateBody -Headers $headers
    
    if ($updateRes.data.name -eq "Updated Test Market" -and $updateRes.data.open_time -eq "11:00 AM") {
        Write-Host "SUCCESS: Market updated correctly."
    } else {
        Write-Error "Update validation failed. Got: $($updateRes.data | ConvertTo-Json)"
    }
} catch {
    Write-Error "Update market failed: $_"
}

# 4. Cleanup (Delete)
try {
    Write-Host "Deleting market..."
    Invoke-RestMethod -Uri "$baseUrl/markets/$marketId" -Method Delete -Headers $headers
    Write-Host "Market deleted."
} catch {
    Write-Error "Delete market failed: $_"
}
