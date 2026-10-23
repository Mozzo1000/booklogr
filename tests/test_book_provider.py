import logging

import pytest
import requests
from flask import Flask

from api.book_provider import BookProvider


@pytest.fixture
def provider():
    app = Flask(__name__)
    app.config.update(
        DATA_PROVIDER="primary",
        DATA_PROVIDER_FALLBACK="fallback",
    )
    with app.app_context():
        yield BookProvider()


@pytest.fixture(autouse=True)
def reject_unmatched_http(monkeypatch):
    def reject(*args, **kwargs):
        raise AssertionError("Unexpected HTTP request in offline provider test")

    monkeypatch.setattr(requests.sessions.Session, "request", reject)


def test_primary_search_result_does_not_call_fallback(provider, monkeypatch):
    calls = []
    primary = [{"isbn": "primary-isbn", "title": "Primary", "author": "Author"}]

    def fetch(provider_name, query):
        calls.append((provider_name, query))
        return primary

    monkeypatch.setattr(provider, "_fetch_search", fetch)

    assert provider.search("query") == primary
    assert calls == [("primary", "query")]


def test_empty_primary_search_uses_fallback_once(provider, monkeypatch):
    calls = []
    fallback = [{"isbn": "fallback-isbn", "title": "Fallback", "author": "Author"}]
    responses = iter([[], fallback])

    def fetch(provider_name, query):
        calls.append((provider_name, query))
        return next(responses)

    monkeypatch.setattr(provider, "_fetch_search", fetch)

    assert provider.search("query") == fallback
    assert calls == [("primary", "query"), ("fallback", "query")]


def test_missing_primary_get_uses_fallback_once(provider, monkeypatch):
    calls = []
    fallback = {"title": "Fallback", "subtitle": None, "author": "Author"}
    responses = iter([None, fallback])

    def fetch(provider_name, isbn):
        calls.append((provider_name, isbn))
        return next(responses)

    monkeypatch.setattr(provider, "_fetch_get", fetch)

    assert provider.get("isbn") == fallback
    assert calls == [("primary", "isbn"), ("fallback", "isbn")]


def test_primary_get_error_uses_fallback_once(provider, monkeypatch):
    calls = []
    fallback = {"title": "Fallback", "subtitle": None, "author": "Author"}

    def fetch(provider_name, isbn):
        calls.append((provider_name, isbn))
        if provider_name == "primary":
            raise RuntimeError("primary failure")
        return fallback

    monkeypatch.setattr(provider, "_fetch_get", fetch)

    assert provider.get("isbn") == fallback
    assert calls == [("primary", "isbn"), ("fallback", "isbn")]


def test_primary_and_fallback_search_errors_return_none_without_sensitive_output(
    provider, monkeypatch, capsys, caplog
):
    calls = []

    def fail(provider_name, query):
        calls.append((provider_name, query))
        raise RuntimeError("secret-query https://private.example/token")

    monkeypatch.setattr(provider, "_fetch_search", fail)

    with caplog.at_level(logging.WARNING, logger="api.book_provider"):
        assert provider.search("secret-query") is None

    assert calls == [("primary", "secret-query"), ("fallback", "secret-query")]
    captured = capsys.readouterr()
    assert "secret-query" not in captured.out + captured.err
    assert "private.example" not in captured.out + captured.err
    assert "secret-query" not in caplog.text
    assert "private.example" not in caplog.text
    assert captured.out.splitlines() == [
        "Primary book search provider primary failed",
        "Fallback book search provider fallback failed",
    ]
    assert [record.message for record in caplog.records] == [
        "Primary book search provider primary failed",
        "Fallback book search provider fallback failed",
    ]
    assert all(record.exc_info is None for record in caplog.records)


def test_primary_and_fallback_get_errors_return_none_without_sensitive_output(
    provider, monkeypatch, capsys, caplog
):
    calls = []

    def fail(provider_name, isbn):
        calls.append((provider_name, isbn))
        raise RuntimeError("secret-isbn https://private.example/token")

    monkeypatch.setattr(provider, "_fetch_get", fail)

    with caplog.at_level(logging.WARNING, logger="api.book_provider"):
        assert provider.get("secret-isbn") is None

    assert calls == [("primary", "secret-isbn"), ("fallback", "secret-isbn")]
    captured = capsys.readouterr()
    assert "secret-isbn" not in captured.out + captured.err
    assert "private.example" not in captured.out + captured.err
    assert "secret-isbn" not in caplog.text
    assert "private.example" not in caplog.text
    assert captured.out.splitlines() == [
        "Primary book detail provider primary failed",
        "Fallback book detail provider fallback failed",
    ]
    assert [record.message for record in caplog.records] == [
        "Primary book detail provider primary failed",
        "Fallback book detail provider fallback failed",
    ]
    assert all(record.exc_info is None for record in caplog.records)


def test_public_search_dispatches_to_custom_primary_url_without_fallback(provider):
    provider.primary_provider = "https://primary.example/metadata"
    provider.fallback_provider = "https://fallback.example/metadata"
    session = RecordingSession(
        FakeResponse(
            [
                {
                    "isbn_13": ["9780000000001"],
                    "title": "Primary title",
                    "author_names": [],
                }
            ]
        )
    )
    provider.session = session

    assert provider.search("query") == [
        {"isbn": "9780000000001", "title": "Primary title", "author": "Unknown"}
    ]
    assert session.calls == [
        (
            "https://primary.example/metadata/v1/search/query",
            {"params": {"limit": 10, "sort": "relevance"}, "timeout": 30},
        )
    ]


def test_public_get_dispatches_to_custom_primary_url_with_defaults(provider):
    provider.primary_provider = "https://primary.example/metadata"
    provider.fallback_provider = "https://fallback.example/metadata"
    session = RecordingSession(FakeResponse({}))
    provider.session = session

    assert provider.get("isbn") == {
        "title": None,
        "subtitle": None,
        "author": "Unknown",
        "description": "",
        "total_pages": 0,
    }
    assert session.calls == [
        ("https://primary.example/metadata/v1/edition/isbn", {"timeout": 30})
    ]


def test_primary_and_fallback_failure_messages_use_safe_custom_provider_labels(
    provider, monkeypatch, capsys, caplog
):
    provider.primary_provider = "https://user:secret@primary.example/private?token=secret"
    provider.fallback_provider = "https://fallback.example/private?secret=secret"

    def fail(provider_name, query):
        raise RuntimeError("secret-query")

    monkeypatch.setattr(provider, "_fetch_search", fail)

    with caplog.at_level(logging.WARNING, logger="api.book_provider"):
        assert provider.search("secret-query") is None

    captured = capsys.readouterr()
    output = captured.out + captured.err + caplog.text
    assert "primary.example" in output
    assert "fallback.example" in output
    assert "secret" not in output
    assert "/private" not in output
    assert "secret-query" not in output


class FakeResponse:
    def __init__(self, payload, status_code=200):
        self.payload = payload
        self.status_code = status_code

    def raise_for_status(self):
        if self.status_code >= 400:
            raise RuntimeError(f"HTTP {self.status_code}")

    def json(self):
        return self.payload


class RecordingSession:
    def __init__(self, *responses):
        self.responses = list(responses)
        self.calls = []

    def get(self, url, **kwargs):
        self.calls.append((url, kwargs))
        return self.responses.pop(0)


def test_existing_openlibrary_search_normalization_is_preserved(provider):
    session = RecordingSession(
        FakeResponse(
            {
                "docs": [
                    {
                        "isbn": ["9780000000001"],
                        "title": "Existing title",
                        "author_name": ["Existing author"],
                    }
                ]
            }
        )
    )
    provider.session = session

    assert provider._search_openlibrary("query") == [
        {"isbn": "9780000000001", "title": "Existing title", "author": "Existing author"}
    ]
    assert session.calls[0][0] == "https://openlibrary.org/search.json"
    assert session.calls[0][1]["timeout"] == 30


def test_existing_openlibrary_get_preserves_subtitle_and_normalization(provider):
    session = RecordingSession(
        FakeResponse(
            {
                "title": "Existing title",
                "subtitle": "Existing subtitle",
                "authors": [{"key": "/authors/existing"}],
                "description": {"value": "Existing description"},
                "number_of_pages": 321,
            }
        ),
        FakeResponse({"name": "Existing author"}),
    )
    provider.session = session

    assert provider._get_openlibrary("9780000000001") == {
        "title": "Existing title",
        "subtitle": "Existing subtitle",
        "author": "Existing author",
        "description": "Existing description",
        "total_pages": 321,
    }
    assert session.calls[0][0] == "https://openlibrary.org/isbn/9780000000001.json"
    assert session.calls[1][0] == "https://openlibrary.org/authors/existing.json"
