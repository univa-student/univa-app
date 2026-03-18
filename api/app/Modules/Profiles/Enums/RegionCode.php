<?php

declare(strict_types=1);

namespace App\Modules\Profiles\Enums;

use Illuminate\Support\Str;

enum RegionCode: string
{
    case CRIMEA = '01';
    case VINNYTSIA = '05';
    case VOLYN = '07';
    case DNIPROPETROVSK = '12';
    case DONETSK = '14';
    case ZHYTOMYR = '18';
    case ZAKARPATTIA = '21';
    case ZAPORIZHZHIA = '23';
    case IVANO_FRANKIVSK = '26';
    case KYIV_REGION = '32';
    case KIROVOHRAD = '35';
    case LUHANSK = '44';
    case LVIV = '46';
    case MYKOLAIV = '48';
    case ODESA = '51';
    case POLTAVA = '53';
    case RIVNE = '56';
    case SUMY = '59';
    case TERNOPIL = '61';
    case KHARKIV = '63';
    case KHERSON = '65';
    case KHMELNYTSKYI = '68';
    case CHERKASY = '71';
    case CHERNIVTSI = '73';
    case CHERNIHIV = '74';
    case KYIV = '80';
    case SEVASTOPOL = '85';

    public function label(): string
    {
        return match ($this) {
            self::CRIMEA => 'Автономна Республіка Крим',
            self::VINNYTSIA => 'Вінницька область',
            self::VOLYN => 'Волинська область',
            self::DNIPROPETROVSK => 'Дніпропетровська область',
            self::DONETSK => 'Донецька область',
            self::ZHYTOMYR => 'Житомирська область',
            self::ZAKARPATTIA => 'Закарпатська область',
            self::ZAPORIZHZHIA => 'Запорізька область',
            self::IVANO_FRANKIVSK => 'Івано-Франківська область',
            self::KYIV_REGION => 'Київська область',
            self::KIROVOHRAD => 'Кіровоградська область',
            self::LUHANSK => 'Луганська область',
            self::LVIV => 'Львівська область',
            self::MYKOLAIV => 'Миколаївська область',
            self::ODESA => 'Одеська область',
            self::POLTAVA => 'Полтавська область',
            self::RIVNE => 'Рівненська область',
            self::SUMY => 'Сумська область',
            self::TERNOPIL => 'Тернопільська область',
            self::KHARKIV => 'Харківська область',
            self::KHERSON => 'Херсонська область',
            self::KHMELNYTSKYI => 'Хмельницька область',
            self::CHERKASY => 'Черкаська область',
            self::CHERNIVTSI => 'Чернівецька область',
            self::CHERNIHIV => 'Чернігівська область',
            self::KYIV => 'м. Київ',
            self::SEVASTOPOL => 'м. Севастополь',
        };
    }

    public static function options(): array
    {
        return array_map(
            static fn (self $case): array => [
                'value' => $case->value,
                'label' => $case->label(),
            ],
            self::cases(),
        );
    }

    public static function values(): array
    {
        return array_map(
            static fn (self $case): string => $case->value,
            self::cases(),
        );
    }

    public static function tryFromLabel(?string $label): ?self
    {
        if ($label === null || trim($label) === '') {
            return null;
        }

        $normalized = self::normalize($label);

        return match ($normalized) {
            'автономна республіка крим', 'арк', 'арк крим' => self::CRIMEA,
            'вінницька область' => self::VINNYTSIA,
            'волинська область' => self::VOLYN,
            'дніпропетровська область' => self::DNIPROPETROVSK,
            'донецька область' => self::DONETSK,
            'житомирська область' => self::ZHYTOMYR,
            'закарпатська область' => self::ZAKARPATTIA,
            'запорізька область' => self::ZAPORIZHZHIA,
            'івано-франківська область' => self::IVANO_FRANKIVSK,
            'київська область' => self::KYIV_REGION,
            'кіровоградська область', 'кропивницька область' => self::KIROVOHRAD,
            'луганська область' => self::LUHANSK,
            'львівська область' => self::LVIV,
            'миколаївська область' => self::MYKOLAIV,
            'одеська область' => self::ODESA,
            'полтавська область' => self::POLTAVA,
            'рівненська область' => self::RIVNE,
            'сумська область' => self::SUMY,
            'тернопільська область' => self::TERNOPIL,
            'харківська область' => self::KHARKIV,
            'херсонська область' => self::KHERSON,
            'хмельницька область' => self::KHMELNYTSKYI,
            'черкаська область' => self::CHERKASY,
            'чернівецька область' => self::CHERNIVTSI,
            'чернігівська область' => self::CHERNIHIV,
            'м київ', 'місто київ', 'київ' => self::KYIV,
            'м севастополь', 'місто севастополь', 'севастополь' => self::SEVASTOPOL,
            default => null,
        };
    }

    private static function normalize(string $label): string
    {
        return Str::of($label)
            ->lower()
            ->replace(['’', '`', '\''], '')
            ->replace('.', '') // ← прибирає всі крапки
            ->replaceMatches('/\bобл\b/u', 'область')
            ->replaceMatches('/\bм\s*/u', 'м ')
            ->replaceMatches('/\s+/u', ' ')
            ->trim()
            ->toString();
    }
}
