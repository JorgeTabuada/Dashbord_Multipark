# Zello API Data — Full Findings

## Auth
- Network: airpark
- Username: admin
- API Key: OHB9BAA637JVW8V4FQNUPZS9ELZFX2SJ
- Login: SUCCESS

## Users (37 total)
Users found in the Zello network (truncated from full output, need to scroll up for all).
Key fields per user: name, display_name, email, channels, admin status, job_title

## Channels (8 total)
1. everyone (33 members)
2. Faro manha (25 members)
3. Front (5 members)
4. Multipark Comunicação (28 members)
5. Multipark Manha (10 members)
6. Multipark Tarde (10 members)
7. Team Leader (9 members)
8. Terminal (12 members)

## Locations (GPS)
- Total: 0, Returned: 0
- No active GPS locations at this time (probably nobody online right now)
- This will populate when users are active with the Zello app

## Next Steps
- Update ZELLO_API_KEY secret to the correct value
- Create Zello helper in server for auth + data fetching
- Integrate users/channels/GPS into the operational module
