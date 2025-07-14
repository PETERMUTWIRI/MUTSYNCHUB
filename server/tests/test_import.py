import pytest
from server.src.main import app

def test_import():
    assert app is not None
