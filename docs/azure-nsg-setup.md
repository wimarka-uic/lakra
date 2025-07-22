# Azure NSG Configuration for Lakra Backend

## Overview
This document provides guidance for configuring Azure Network Security Group (NSG) rules to allow HTTPS traffic to your Lakra backend service running on port 443.

## Required NSG Rules

### Inbound Security Rules

1. **HTTPS Inbound Rule**
   - **Name**: `Allow-HTTPS-Inbound`
   - **Priority**: `100` (or appropriate priority)
   - **Source**: `Internet` (or specific IP ranges for better security)
   - **Source port ranges**: `*`
   - **Destination**: `Any`
   - **Destination port ranges**: `443`
   - **Protocol**: `TCP`
   - **Action**: `Allow`

2. **SSH Access (for server management)**
   - **Name**: `Allow-SSH-Inbound`
   - **Priority**: `110`
   - **Source**: `Your IP address` (for security)
   - **Source port ranges**: `*`
   - **Destination**: `Any`
   - **Destination port ranges**: `22`
   - **Protocol**: `TCP`
   - **Action**: `Allow`

### Outbound Security Rules
- Default outbound rules usually allow all outbound traffic
- No additional configuration needed unless you have restrictive policies

## Security Considerations

### Production Recommendations
1. **Restrict Source IPs**: Instead of allowing from `Internet`, specify:
   - Your organization's IP ranges
   - CDN provider IP ranges (if using a CDN)
   - Load balancer IP ranges

2. **Additional Security Layers**:
   - Use Azure Application Gateway with Web Application Firewall (WAF)
   - Implement DDoS protection
   - Enable Azure Security Center recommendations

3. **SSL/TLS Configuration**:
   - When you get a domain, update the Caddyfile to use real certificates
   - Consider using Azure Key Vault for certificate management

## Azure CLI Commands

### Create NSG Rule for HTTPS
```bash
# Create the NSG rule
az network nsg rule create \
  --resource-group <your-resource-group> \
  --nsg-name <your-nsg-name> \
  --name Allow-HTTPS-Inbound \
  --protocol Tcp \
  --priority 100 \
  --destination-port-range 443 \
  --access Allow \
  --direction Inbound

# List current rules to verify
az network nsg rule list \
  --resource-group <your-resource-group> \
  --nsg-name <your-nsg-name> \
  --output table
```

### Update Existing Rule
```bash
az network nsg rule update \
  --resource-group <your-resource-group> \
  --nsg-name <your-nsg-name> \
  --name Allow-HTTPS-Inbound \
  --destination-port-range 443
```

## Testing Connectivity

### From Azure VM
```bash
# Test if Caddy is listening on port 443
sudo netstat -tlnp | grep :443

# Test local connectivity
curl -k https://localhost:443/health

# Test from another machine (replace <VM-IP> with actual IP)
curl -k https://<VM-IP>:443/health
```

### From External Network
```bash
# Test external connectivity (replace <VM-PUBLIC-IP> with actual public IP)
curl -k https://<VM-PUBLIC-IP>:443/health
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if Caddy is running: `ps aux | grep caddy`
   - Check if port 443 is open: `sudo netstat -tlnp | grep :443`
   - Verify NSG rules are applied correctly

2. **Permission Denied (Port 443)**
   - Run with sudo: `sudo ./run-backend.sh`
   - Or give Caddy capability: `sudo setcap cap_net_bind_service=+ep $(which caddy)`

3. **SSL Certificate Warnings**
   - Expected with self-signed certificates (localhost)
   - Use `-k` flag with curl or accept certificate in browser
   - Replace with real domain and certificate for production

4. **Azure-specific Issues**
   - Check Azure Network Watcher for connectivity issues
   - Verify VM has public IP if accessing from internet
   - Check Azure Load Balancer configuration if using one

## Next Steps for Production

1. **Get a Domain**: Register a domain name for your application
2. **Update Caddyfile**: Replace localhost with your domain
3. **Automatic HTTPS**: Let Caddy handle Let's Encrypt certificates automatically
4. **Azure DNS**: Consider using Azure DNS for domain management
5. **CDN**: Consider Azure CDN for better performance and additional security

## Example Production Caddyfile
```
yourdomain.com {
    reverse_proxy localhost:8000
    
    # Automatic HTTPS with Let's Encrypt
    tls your-email@example.com
    
    # Security headers
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        X-XSS-Protection "1; mode=block"
    }
    
    # Rate limiting
    rate_limit {
        zone static_ip_10rps 10r/s
    }
    
    log {
        output file /var/log/caddy/lakra-backend.log
        format console
    }
}
```
