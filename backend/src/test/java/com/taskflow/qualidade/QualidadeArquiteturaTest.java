package com.taskflow.qualidade;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;
import com.tngtech.archunit.library.GeneralCodingRules;

@AnalyzeClasses(packages = QualidadeArquiteturaTest.PACOTE_BASE,
        importOptions = ImportOption.DoNotIncludeTests.class)
class QualidadeArquiteturaTest {

    static final String PACOTE_BASE = "com.taskflow";
    static final String CLASSE_DE_LOG = "com.taskflow.comum.log.AppLogger";

    @ArchTest
    static final ArchRule SEM_SAIDA_PADRAO =
            GeneralCodingRules.NO_CLASSES_SHOULD_ACCESS_STANDARD_STREAMS;

    @ArchTest
    static final ArchRule SEM_JAVA_UTIL_LOGGING =
            GeneralCodingRules.NO_CLASSES_SHOULD_USE_JAVA_UTIL_LOGGING;

    @ArchTest
    static final ArchRule LOG_SOMENTE_PELA_CLASSE_CENTRAL = noClasses()
            .that().doNotHaveFullyQualifiedName(CLASSE_DE_LOG)
            .should().dependOnClassesThat()
            .resideInAnyPackage("org.slf4j..", "org.apache.logging..");
}
