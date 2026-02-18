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

# 2. Get Initial Rates
try {
    Write-Host "Fetching current rates..."
    $getRes = Invoke-RestMethod -Uri "$baseUrl/games/rates" -Method Get -Headers $headers
    $initialRates = $getRes.data
    Write-Host "Current rates fetched. Count: $($initialRates.Count)"
} catch {
    Write-Error "Fetch rates failed: $_"
    exit 1
}

# 3. Update Rates (Change Single Digit to 1:12)
$newRates = $initialRates | ForEach-Object {
    if ($_.type -eq "single_digit") {
        @{ type = $_.type; name = $_.name; rate = "1:12" }
    } else {
        $_
    }
}

$updateBody = @{
    rates = $newRates
} | ConvertTo-Json -Depth 10

try {
    Write-Host "Updating Single Digit rate to 1:12..."
    $updateRes = Invoke-RestMethod -Uri "$baseUrl/games/rates" -Method Post -Body $updateBody -Headers $headers
    
    $singleDigit = $updateRes.data | Where-Object { $_.type -eq "single_digit" }
    
    if ($singleDigit.rate -eq "1:12") {
        Write-Host "SUCCESS: Rate updated to 1:12."
    } else {
        Write-Error "Update failed. Got: $($singleDigit.rate)"
    }
} catch {
    Write-Error "Update rates failed: $_"
    exit 1
}

# 4. Revert Rates (Change Single Digit back to 1:10)
$revertRates = $initialRates | ForEach-Object {
    if ($_.type -eq "single_digit") {
        @{ type = $_.type; name = $_.name; rate = "1:10" }
    } else {
        $_
    }
}

$revertBody = @{
    rates = $revertRates
} | ConvertTo-Json -Depth 10

try {
    Write-Host "Reverting Single Digit rate to 1:10..."
    $revertRes = Invoke-RestMethod -Uri "$baseUrl/games/rates" -Method Post -Body $revertBody -Headers $headers
    
    $singleDigitReverted = $revertRes.data | Where-Object { $_.type -eq "single_digit" }
    
    if ($singleDigitReverted.rate -eq "1:10") {
        Write-Host "SUCCESS: Rate reverted to 1:10."
    } else {
        Write-Error "Revert failed. Got: $($singleDigitReverted.rate)"
    }
} catch {
    Write-Error "Revert rates failed: $_"
    exit 1
}
