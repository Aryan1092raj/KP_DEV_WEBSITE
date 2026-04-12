def normalize_text(value: str | None) -> str | None:
    return value.strip() if isinstance(value, str) else value


def normalize_empty_url(value: object) -> object:
    if value in ("", None):
        return None
    return value
