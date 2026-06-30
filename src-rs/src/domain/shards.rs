use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};

use super::sky_time::{sky_wall_time_to_instant, SkyDate};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ShardColor {
    Black,
    Red,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ShardPrediction {
    pub color: ShardColor,
    pub realm: String,
    pub location: String,
    pub reward_label: String,
    pub gate_visible_at: DateTime<Utc>,
    pub lands_at: DateTime<Utc>,
    pub clears_at: DateTime<Utc>,
    pub source_label: &'static str,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum ShardSlot {
    OneFifty,
    TwoTen,
    SevenForty,
    TwoTwenty,
    ThreeThirty,
}

const SLOT_SEQUENCE: [ShardSlot; 12] = [
    ShardSlot::SevenForty,
    ShardSlot::TwoTen,
    ShardSlot::TwoTwenty,
    ShardSlot::OneFifty,
    ShardSlot::ThreeThirty,
    ShardSlot::TwoTen,
    ShardSlot::SevenForty,
    ShardSlot::OneFifty,
    ShardSlot::TwoTwenty,
    ShardSlot::TwoTen,
    ShardSlot::ThreeThirty,
    ShardSlot::OneFifty,
];

const REALMS: [&str; 5] = ["Prairie", "Forest", "Valley", "Wasteland", "Vault"];

impl ShardSlot {
    fn time(self) -> (u32, u32) {
        match self {
            Self::OneFifty => (1, 50),
            Self::TwoTen => (2, 10),
            Self::SevenForty => (7, 40),
            Self::TwoTwenty => (2, 20),
            Self::ThreeThirty => (3, 30),
        }
    }

    fn no_shard_days(self) -> &'static [u32] {
        match self {
            Self::OneFifty => &[6, 0],
            Self::TwoTen => &[0, 1],
            Self::SevenForty => &[1, 2],
            Self::TwoTwenty => &[2, 3],
            Self::ThreeThirty => &[3, 4],
        }
    }

    fn color(self) -> ShardColor {
        match self {
            Self::OneFifty | Self::TwoTen => ShardColor::Black,
            Self::SevenForty | Self::TwoTwenty | Self::ThreeThirty => ShardColor::Red,
        }
    }

    fn locations(self) -> &'static [&'static str; 5] {
        match self {
            Self::OneFifty => &[
                "Butterfly Field",
                "Forest Brook",
                "Ice Rink",
                "Broken Temple",
                "Starlight Desert",
            ],
            Self::TwoTen => &[
                "Village Islands",
                "Boneyard",
                "Ice Rink",
                "Battlefield",
                "Starlight Desert",
            ],
            Self::SevenForty => &[
                "Cave",
                "Forest Garden",
                "Village of Dreams",
                "Graveyard",
                "Jellyfish Cove",
            ],
            Self::TwoTwenty => &[
                "Bird Nest",
                "Treehouse",
                "Village of Dreams",
                "Crabfield",
                "Jellyfish Cove",
            ],
            Self::ThreeThirty => &[
                "Sanctuary Island",
                "Elevated Clearing",
                "Hermit Valley",
                "Forgotten Ark",
                "Jellyfish Cove",
            ],
        }
    }
}

pub fn predict_shard_for_sky_date(date: SkyDate) -> Option<ShardPrediction> {
    let slot = SLOT_SEQUENCE[((date.day_of_month() - 1) as usize) % SLOT_SEQUENCE.len()];
    let day_of_week = date.day_of_week_temporal() % 7;

    if slot.no_shard_days().contains(&day_of_week) {
        return None;
    }

    let color = slot.color();
    let realm_index = ((date.day_of_month() - 1) as usize) % REALMS.len();
    let (hour, minute) = slot.time();
    let gate_visible_at = sky_wall_time_to_instant(date, hour, minute)?;

    Some(build_prediction(
        color,
        REALMS[realm_index],
        slot.locations()[realm_index],
        gate_visible_at,
    ))
}

pub fn get_shard_windows(date: SkyDate) -> Vec<ShardPrediction> {
    let Some(first) = predict_shard_for_sky_date(date) else {
        return Vec::new();
    };
    let spacing_hours = shard_spacing_hours(first.color);

    (0..3)
        .map(|index| {
            let gate_visible_at = first.gate_visible_at + Duration::hours(index * spacing_hours);
            build_prediction(first.color, &first.realm, &first.location, gate_visible_at)
        })
        .collect()
}

fn build_prediction(
    color: ShardColor,
    realm: &str,
    location: &str,
    gate_visible_at: DateTime<Utc>,
) -> ShardPrediction {
    ShardPrediction {
        color,
        realm: realm.to_string(),
        location: location.to_string(),
        reward_label: match color {
            ShardColor::Red => "Ascended Candle light",
            ShardColor::Black => "Regular candle light",
        }
        .to_string(),
        gate_visible_at,
        lands_at: gate_visible_at + Duration::minutes(8) + Duration::seconds(40),
        clears_at: gate_visible_at + Duration::hours(shard_spacing_hours(color)),
        source_label: "community predicted",
    }
}

fn shard_spacing_hours(color: ShardColor) -> i64 {
    match color {
        ShardColor::Red => 6,
        ShardColor::Black => 8,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn fixtures_a_red_shard_date() {
        let shard = predict_shard_for_sky_date(SkyDate::parse("2026-04-01").unwrap()).unwrap();

        assert_eq!(shard.color, ShardColor::Red);
        assert_eq!(shard.location, "Cave");
        assert_eq!(shard.reward_label, "Ascended Candle light");
    }

    #[test]
    fn fixtures_a_no_shard_day() {
        let shard = predict_shard_for_sky_date(SkyDate::parse("2026-04-26").unwrap());

        assert!(shard.is_none());
    }

    #[test]
    fn expands_red_shards_to_three_six_hour_windows() {
        let windows = get_shard_windows(SkyDate::parse("2026-04-01").unwrap());

        assert_eq!(windows.len(), 3);
        assert_eq!(
            windows[1].gate_visible_at - windows[0].gate_visible_at,
            Duration::hours(6)
        );
        assert_eq!(
            windows[2].gate_visible_at - windows[1].gate_visible_at,
            Duration::hours(6)
        );
    }
}
