package com.taskflow.tempo;

import java.time.Clock;
import java.time.Instant;

class ComponenteComClock {

    private final Clock clock;

    ComponenteComClock(Clock clock) {
        this.clock = clock;
    }

    Instant instanteAtual() {
        return Instant.now(clock);
    }
}
