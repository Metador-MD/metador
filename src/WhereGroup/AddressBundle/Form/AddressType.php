<?php

namespace WhereGroup\AddressBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;

/**
 * Class AddressType
 * @package WhereGroup\AddressBundle\Form
 */
class AddressType extends AbstractType
{

    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {

        $builder
            ->add('uuid', TextType::class, [
                'label'     => 'ID',
                'required'  => false,
                'attr' => ['readonly' => true,],
            ])->add('individualName', TextType::class, [
                'label'    => 'Zuständige Person',
                'required' => false
            ])->add('organisationName', TextType::class, [
                'label'    => 'Name der Organisation',
                'required' => false
            ])->add('department', TextType::class, [
                'label'    => 'Abteilung',
                'required' => false
            ])->add('positionName', TextType::class, [
                'label'    => 'Funktion der Person',
                'required' => false
            ])->add('email', TextareaType::class, [
                'label'    => 'E-Mail',
                'required' => false
            ])->add('country', ChoiceType::class, [
                'choices' => ['' => '', 'Deutschland' => 'DE'],
                'label'    => 'Land / Staat',
                'required' => false
            ])->add('administrativeArea', ChoiceType::class, [
                'choices' => [
                    ''                       => '',
                    'Baden-Württemberg'      => 'Baden-Württemberg',
                    'Bayern'                 => 'Bayern',
                    'Berlin'                 => 'Berlin',
                    'Brandenburg'            => 'Brandenburg',
                    'Bremen'                 => 'Bremen',
                    'Hamburg'                => 'Hamburg',
                    'Hessen'                 => 'Hessen',
                    'Mecklenburg-Vorpommern' => 'Mecklenburg-Vorpommern',
                    'Niedersachsen'          => 'Niedersachsen',
                    'Nordrhein-Westfalen'    => 'Nordrhein-Westfalen',
                    'Rheinland-Pfalz'        => 'Rheinland-Pfalz',
                    'Saarland'               => 'Saarland',
                    'Sachsen-Anhalt'         => 'Sachsen-Anhalt',
                    'Schleswig-Holstein'     => 'Schleswig-Holstein',
                    'Thüringen'              => 'Thüringen'
                ],
                'label'    => 'Bundesland',
                'required' => false
            ])->add('deliveryPoint', TextType::class, [
                'label'    => 'Straße und Hausnummer / Postfach',
                'required' => false
            ])->add('city', TextType::class, [
                'label'    => 'Stadt / Ort',
                'required' => false
            ])->add('postalCode', TextType::class, [
                'label'    => 'PLZ',
                'required' => false
            ])->add('voice', TextType::class, [
                'label'    => 'Telefonnummer',
                'required' => false
            ])->add('facsimile', TextType::class, [
                'label'    => 'Faxnummer',
                'required' => false
            ])->add('url', TextType::class, [
                'label'    => 'Internetadresse',
                'required' => false
            ])->add('urlDescription', TextareaType::class, [
                'label'    => 'Beschreibung der Internetadresse',
                'required' => false
            ])->add('hoursOfService', TextareaType::class, [
                'label'    => 'Erreichbarkeit',
                'required' => false
            ]);
    }
}
