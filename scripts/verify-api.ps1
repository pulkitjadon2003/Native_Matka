$baseUrl = "http://localhost:3000/api"
$loginBody = @{
    mobile = "9876543210"
    password = "123456"
    is_admin_login = $true
} | ConvertTo-Json

try {
    Write-Host "Logging in..."
    $loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
    $token = $loginRes.token
    
    if (-not $token) {
        Write-Error "No token received"
        exit 1
    }
    Write-Host "Login successful."

    # Need a valid user ID. The previous script created one.
    # Note: If the previous script failed before creating user or ID is wrong, this part fails.
    # But since I saw the ID in output, I assume it exists.
    $testUserId = "69948e96e744adc2c7a96e69" 

    $headers = @{ Authorization = "Bearer $token" }
    
    # Deactivate
    Write-Host "Deactivating user..."
    $patchBody = @{ is_active = $false } | ConvertTo-Json
    $patchRes = Invoke-RestMethod -Uri "$baseUrl/users/$testUserId" -Method Patch -ContentType "application/json" -Body $patchBody -Headers $headers
    Write-Host "Response: $($patchRes.message)"
    Write-Host "User Active Status: $($patchRes.data.is_active)"

    if ($patchRes.data.is_active -eq $false) {
        Write-Host "SUCCESS: User deactivated."
    } else {
        Write-Error "FAILURE: User not deactivated."
    }

    # Activate
    Write-Host "Activating user..."
    $patchBody2 = @{ is_active = $true } | ConvertTo-Json
    $patchRes2 = Invoke-RestMethod -Uri "$baseUrl/users/$testUserId" -Method Patch -ContentType "application/json" -Body $patchBody2 -Headers $headers
    Write-Host "Response: $($patchRes2.message)"
    Write-Host "User Active Status: $($patchRes2.data.is_active)"

    if ($patchRes2.data.is_active -eq $true) {
        Write-Host "SUCCESS: User activated."
    } else {
        Write-Error "FAILURE: User not activated."
    }

} catch {
    Write-Host "Error: $_"
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
        Write-Host "Status Description: $($_.Exception.Response.StatusDescription)"
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $respBody = $reader.ReadToEnd()
        # Truncate body
        if ($respBody.Length -gt 500) {
            $respBody = $respBody.Substring(0, 500) + "..."
        }
        Write-Host "Response Body (Truncated): $respBody"
    } else {
        Write-Host "No response received. Exception: $($_.Exception)"
    }
}
