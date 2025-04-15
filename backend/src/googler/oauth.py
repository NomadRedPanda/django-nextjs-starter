from urllib.parse import urljoin, urlencode
from django.conf import settings
from django.core.cache import cache
from django.urls import reverse
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from . import security
import requests

GOOGLE_AUTH_CACHE_KEY_PREFIX = "google:auth:state"
GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID
GOOGLE_SECRET_KEY = settings.GOOGLE_SECRET_KEY
GOOGLE_AUTH_BASE_URL = settings.GOOGLE_AUTH_BASE_URL


def get_google_auth_callback_path():
    return reverse("googler:callback")

def get_google_auth_callback_url(drop_https=False, force_https=False):
    """Generate the callback URL for Google OAuth 2.0 authentication."""
    callback_path = getattr(settings, "GOOGLE_AUTH_CALLBACK_PATH", None) or get_google_auth_callback_path()
    url = urljoin(GOOGLE_AUTH_BASE_URL, callback_path)
    if drop_https:
        url = url.replace('https://', 'http://')
    if force_https:
        url = url.replace('http://', 'https://')
    return url

def generate_auth_url():
    """Generate the authentication URL for Google OAuth 2.0."""
    redirect_uri = get_google_auth_callback_url()
    # public state item
    state = security.generate_state()

    # private ,public
    code_verifier, code_challenge = security.generate_pkce_pair()

    # use redis caching key-val
    cache_key = f"{GOOGLE_AUTH_CACHE_KEY_PREFIX}:{state}"
    cache.set(cache_key, code_verifier, timeout=30)
    # cache.get(cache_key)

    # google cloud auth platform client id
    google_auth_client_id = GOOGLE_CLIENT_ID

    scope = " ".join([
        "openid", 
        "email", 
        "profile",
    ])

    auth_params ={
        'client_id': google_auth_client_id,
        'redirect_uri': redirect_uri,
        'state': state,
        'scope': scope,
        'code_challenge': code_challenge,
        'code_challenge_method': 'S256',
        'access_type': 'offline',
        'response_type': 'code',
        'prompt': 'select_account',
    }

    encoded_params = urlencode(auth_params)
    google_oauth_url = "https://accounts.google.com/o/oauth2/v2/auth"
    return urljoin(google_oauth_url, f"?{encoded_params}")


def verify_google_outh_callback(state, code):
    redirect_uri = get_google_auth_callback_url()
    cache_key = f"{GOOGLE_AUTH_CACHE_KEY_PREFIX}:{state}"
    code_verifier = cache.get(cache_key)
    if code_verifier is None or code is None or state is None:
        raise ValueError("Invalid code or expired code")
    
    token_endpoint = "https://oauth2.googleapis.com/token"
    token_data = {
        'client_id': GOOGLE_CLIENT_ID,
        'client_secret': GOOGLE_SECRET_KEY,
        'code': code,
        'redirect_uri': redirect_uri,
        'grant_type': 'authorization_code',
        'code_verifier': code_verifier
    }
    r = requests.post(token_endpoint, data=token_data)
    r.raise_for_status()
    
    return r.json()

def verify_token_json(token_json):
    id_token_jwt = token_json.get('id_token')
    google_user_info = id_token.verify_oauth2_token(
        id_token_jwt,
        google_requests.Request(),
        GOOGLE_CLIENT_ID
    )
    if google_user_info["iss"] not in [
        "accounts.google.com",
        "https://accounts.google.com"
    ]:
        raise ValueError("Invalid issuer")    
    return google_user_info
