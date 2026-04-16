from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    debug: bool = False
    database_url: str = ""
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = ""
    cors_origins: list[str] = [
        "http://localhost:3000",
        "https://forge-finance-jet.vercel.app",
    ]

    # Plaid
    plaid_client_id: str = ""
    plaid_secret: str = ""
    plaid_env: str = "sandbox"
    plaid_webhook_url: str = ""

    # Voyage AI
    voyage_api_key: str = ""

    # Sentry
    sentry_dsn: str = ""

    # Stripe (v5.0.0 Apex)
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_id_pro: str = ""

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
