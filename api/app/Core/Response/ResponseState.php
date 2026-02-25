<?php

namespace App\Core\Response;

enum ResponseState: int
{
    case OK = 200;
    case Created = 201;
    case Error = 500;
    case Warning = 400;
    case NotFound = 404;
    case Unauthorized = 401;
    case Forbidden = 403;
    case Unprocessable = 422;
}
